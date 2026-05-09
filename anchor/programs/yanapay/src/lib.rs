use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

pub mod errors;
pub mod state;

use errors::*;
use state::*;

declare_id!("Bb6S12fkeaRJ6X3ZUqicvYH89d8mXtvA6H31hoRx53dc");

#[program]
pub mod yanapay {
    use super::*;

    // ── Admin ──────────────────────────────────────────────────────────────

    /// Inicializa la configuración global del programa (solo una vez).
    pub fn initialize_admin(ctx: Context<InitializeAdmin>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.total_orgs = 0;
        config.total_donors = 0;
        config.total_donated_lamports = 0;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    // ── Registration ───────────────────────────────────────────────────────

    /// Registra un donante (Persona Natural o Jurídica).
    pub fn register_donor(
        ctx: Context<RegisterDonor>,
        params: RegisterDonorParams,
    ) -> Result<()> {
        require!(!params.full_name.is_empty(), YanaPayError::EmptyName);

        match params.donor_type {
            DonorType::Natural => {
                require!(params.dni_ruc.len() == 8, YanaPayError::InvalidDni);
                require!(
                    params.dni_ruc.chars().all(|c| c.is_ascii_digit()),
                    YanaPayError::InvalidDni
                );
            }
            DonorType::Juridica => {
                require!(params.dni_ruc.len() == 11, YanaPayError::InvalidRuc);
                require!(
                    params.dni_ruc.chars().all(|c| c.is_ascii_digit()),
                    YanaPayError::InvalidRuc
                );
                require!(!params.company_name.is_empty(), YanaPayError::EmptyName);
            }
        }

        let profile = &mut ctx.accounts.donor_profile;
        profile.wallet = ctx.accounts.signer.key();
        profile.donor_type = params.donor_type;
        profile.full_name = params.full_name;
        profile.dni_ruc = params.dni_ruc;
        profile.company_name = params.company_name;
        profile.legal_rep = params.legal_rep;
        profile.registered_at = Clock::get()?.unix_timestamp;
        profile.total_donated = 0;
        profile.donation_count = 0;
        profile.bump = ctx.bumps.donor_profile;

        let config = &mut ctx.accounts.config;
        config.total_donors += 1;

        Ok(())
    }

    /// Registra una organización (ONG / albergue). Estado inicial: Pending.
    pub fn register_org(
        ctx: Context<RegisterOrg>,
        params: RegisterOrgParams,
    ) -> Result<()> {
        require!(!params.org_name.is_empty(), YanaPayError::EmptyName);
        require!(params.ruc.len() == 11, YanaPayError::InvalidRuc);
        require!(
            params.ruc.chars().all(|c| c.is_ascii_digit()),
            YanaPayError::InvalidRuc
        );

        let profile = &mut ctx.accounts.org_profile;
        profile.wallet = ctx.accounts.signer.key();
        profile.org_name = params.org_name;
        profile.ruc = params.ruc;
        profile.description = params.description;
        profile.logo_uri = params.logo_uri;
        profile.banner_uri = params.banner_uri;
        profile.social_media = params.social_media;
        profile.status = OrgStatus::Pending;
        profile.validated_at = 0;
        profile.registered_at = Clock::get()?.unix_timestamp;
        profile.total_received = 0;
        profile.wishlist_count = 0;
        profile.bump = ctx.bumps.org_profile;

        let config = &mut ctx.accounts.config;
        config.total_orgs += 1;

        Ok(())
    }

    // ── HOTL Admin Validation ──────────────────────────────────────────────

    /// El administrador valida o rechaza una organización (Human-on-the-Loop).
    pub fn validate_org(ctx: Context<ValidateOrg>, status: OrgStatus) -> Result<()> {
        let profile = &mut ctx.accounts.org_profile;
        profile.status = status;
        if profile.status == OrgStatus::Validated {
            profile.validated_at = Clock::get()?.unix_timestamp;
        }
        Ok(())
    }

    // ── Wishlist ───────────────────────────────────────────────────────────

    /// La ONG crea una lista de deseos con un monto objetivo en lamports.
    pub fn create_wishlist(
        ctx: Context<CreateWishlist>,
        params: CreateWishlistParams,
    ) -> Result<()> {
        require!(!params.title.is_empty(), YanaPayError::EmptyName);
        require!(params.target_amount > 0, YanaPayError::InvalidTargetAmount);

        let org_profile = &mut ctx.accounts.org_profile;
        require!(
            org_profile.status == OrgStatus::Validated,
            YanaPayError::OrgNotValidated
        );

        let wishlist_id = org_profile.wishlist_count;

        let wishlist = &mut ctx.accounts.wishlist;
        wishlist.org = ctx.accounts.signer.key();
        wishlist.title = params.title;
        wishlist.description = params.description;
        wishlist.target_amount = params.target_amount;
        wishlist.raised_amount = 0;
        wishlist.donor_count = 0;
        wishlist.status = WishlistStatus::Active;
        wishlist.created_at = Clock::get()?.unix_timestamp;
        wishlist.funded_at = 0;
        wishlist.completed_at = 0;
        wishlist.invoice_uri = String::new();
        wishlist.id = wishlist_id;
        wishlist.escrow_bump = ctx.bumps.escrow_vault;
        wishlist.bump = ctx.bumps.wishlist;

        org_profile.wishlist_count += 1;

        Ok(())
    }

    // ── Donations ──────────────────────────────────────────────────────────

    /// Donación voluntaria directa al wallet de la ONG (sin escrow).
    pub fn donate_voluntary(ctx: Context<DonateVoluntary>, amount: u64) -> Result<()> {
        require!(amount > 0, YanaPayError::InvalidAmount);
        require!(
            ctx.accounts.org_profile.status == OrgStatus::Validated,
            YanaPayError::OrgNotValidated
        );

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.donor.to_account_info(),
                    to: ctx.accounts.org_wallet.to_account_info(),
                },
            ),
            amount,
        )?;

        let org_profile = &mut ctx.accounts.org_profile;
        org_profile.total_received += amount;

        let config = &mut ctx.accounts.config;
        config.total_donated_lamports += amount;

        Ok(())
    }

    /// Donación a una lista de deseos específica (funds go to escrow vault PDA).
    pub fn donate_to_wishlist(ctx: Context<DonateToWishlist>, amount: u64) -> Result<()> {
        require!(amount > 0, YanaPayError::InvalidAmount);

        {
            let wishlist = &ctx.accounts.wishlist;
            require!(
                wishlist.status == WishlistStatus::Active,
                YanaPayError::WishlistNotActive
            );
            let remaining = wishlist.target_amount.saturating_sub(wishlist.raised_amount);
            require!(amount <= remaining, YanaPayError::AmountExceedsTarget);
        }

        // Transfer to escrow vault
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.donor.to_account_info(),
                    to: ctx.accounts.escrow_vault.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update donation record (init_if_needed handles first-time)
        let record = &mut ctx.accounts.donation_record;
        if record.donor == Pubkey::default() {
            record.donor = ctx.accounts.donor.key();
            record.wishlist = ctx.accounts.wishlist.key();
            record.donated_at = Clock::get()?.unix_timestamp;
            record.bump = ctx.bumps.donation_record;

            let wishlist = &mut ctx.accounts.wishlist;
            wishlist.donor_count += 1;
        }
        record.amount += amount;

        // Update wishlist state
        let wishlist = &mut ctx.accounts.wishlist;
        wishlist.raised_amount += amount;

        if wishlist.raised_amount >= wishlist.target_amount {
            wishlist.status = WishlistStatus::Funded;
            wishlist.funded_at = Clock::get()?.unix_timestamp;
        }

        // Update donor profile
        let donor_profile = &mut ctx.accounts.donor_profile;
        donor_profile.total_donated += amount;
        donor_profile.donation_count += 1;

        // Update global config
        let config = &mut ctx.accounts.config;
        config.total_donated_lamports += amount;

        Ok(())
    }

    // ── HOTL Release Flow ──────────────────────────────────────────────────

    /// La ONG sube la URI de la factura/boleta como prueba de compra.
    pub fn submit_invoice(ctx: Context<SubmitInvoice>, invoice_uri: String) -> Result<()> {
        require!(!invoice_uri.is_empty(), YanaPayError::EmptyInvoiceUri);

        let wishlist = &mut ctx.accounts.wishlist;
        require!(
            wishlist.status == WishlistStatus::Funded,
            YanaPayError::WishlistNotFunded
        );
        require!(
            wishlist.invoice_uri.is_empty(),
            YanaPayError::InvoiceAlreadySubmitted
        );

        wishlist.invoice_uri = invoice_uri;
        Ok(())
    }

    /// El admin valida la factura y libera los fondos del escrow a la ONG.
    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow_balance = ctx.accounts.escrow_vault.lamports();
        require!(escrow_balance > 0, YanaPayError::NoFundsToRelease);

        {
            let wishlist = &ctx.accounts.wishlist;
            require!(
                wishlist.status == WishlistStatus::Funded,
                YanaPayError::WishlistNotFunded
                );
            require!(
                !wishlist.invoice_uri.is_empty(),
                YanaPayError::EmptyInvoiceUri
            );
        }

        // PDA signer seeds for escrow vault
        let wishlist_key = ctx.accounts.wishlist.key();
        let escrow_seeds: &[&[&[u8]]] = &[&[
            b"escrow",
            wishlist_key.as_ref(),
            &[ctx.accounts.wishlist.escrow_bump],
        ]];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.org_wallet.to_account_info(),
                },
                escrow_seeds,
            ),
            escrow_balance,
        )?;

        let wishlist = &mut ctx.accounts.wishlist;
        wishlist.status = WishlistStatus::Completed;
        wishlist.completed_at = Clock::get()?.unix_timestamp;

        let org_profile = &mut ctx.accounts.org_profile;
        org_profile.total_received += escrow_balance;

        Ok(())
    }

    /// El admin rechaza la factura, devuelve el estado de wishlist a Funded.
    pub fn reject_invoice(ctx: Context<RejectInvoice>) -> Result<()> {
        let wishlist = &mut ctx.accounts.wishlist;
        require!(
            wishlist.status == WishlistStatus::Funded,
            YanaPayError::WishlistNotFunded
        );
        wishlist.invoice_uri = String::new();
        Ok(())
    }
}

// ── Account Contexts ─────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeAdmin<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + AdminConfig::INIT_SPACE,
        seeds = [b"admin"],
        bump
    )]
    pub config: Account<'info, AdminConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterDonor<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + DonorProfile::INIT_SPACE,
        seeds = [b"donor", signer.key().as_ref()],
        bump
    )]
    pub donor_profile: Account<'info, DonorProfile>,
    #[account(
        mut,
        seeds = [b"admin"],
        bump = config.bump
    )]
    pub config: Account<'info, AdminConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterOrg<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + OrgProfile::INIT_SPACE,
        seeds = [b"org", signer.key().as_ref()],
        bump
    )]
    pub org_profile: Account<'info, OrgProfile>,
    #[account(
        mut,
        seeds = [b"admin"],
        bump = config.bump
    )]
    pub config: Account<'info, AdminConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidateOrg<'info> {
    #[account(
        constraint = config.admin == admin.key() @ YanaPayError::Unauthorized
    )]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"admin"],
        bump = config.bump
    )]
    pub config: Account<'info, AdminConfig>,
    #[account(mut)]
    pub org_profile: Account<'info, OrgProfile>,
}

#[derive(Accounts)]
#[instruction(params: CreateWishlistParams)]
pub struct CreateWishlist<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"org", signer.key().as_ref()],
        bump = org_profile.bump
    )]
    pub org_profile: Account<'info, OrgProfile>,
    #[account(
        init,
        payer = signer,
        space = 8 + Wishlist::INIT_SPACE,
        seeds = [b"wishlist", signer.key().as_ref(), &org_profile.wishlist_count.to_le_bytes()],
        bump
    )]
    pub wishlist: Account<'info, Wishlist>,
    /// CHECK: Sistema escrow PDA para esta wishlist (sin datos, solo SOL)
    #[account(
        mut,
        seeds = [b"escrow", wishlist.key().as_ref()],
        bump
    )]
    pub escrow_vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DonateVoluntary<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    /// CHECK: Wallet de la ONG validada como destino de fondos voluntarios
    #[account(
        mut,
        constraint = org_profile.wallet == org_wallet.key() @ YanaPayError::Unauthorized
    )]
    pub org_wallet: SystemAccount<'info>,
    #[account(mut)]
    pub org_profile: Account<'info, OrgProfile>,
    #[account(
        mut,
        seeds = [b"admin"],
        bump = config.bump
    )]
    pub config: Account<'info, AdminConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DonateToWishlist<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    #[account(
        mut,
        seeds = [b"donor", donor.key().as_ref()],
        bump = donor_profile.bump
    )]
    pub donor_profile: Account<'info, DonorProfile>,
    #[account(mut)]
    pub wishlist: Account<'info, Wishlist>,
    /// CHECK: Escrow PDA para la wishlist
    #[account(
        mut,
        seeds = [b"escrow", wishlist.key().as_ref()],
        bump = wishlist.escrow_bump
    )]
    pub escrow_vault: SystemAccount<'info>,
    #[account(
        init_if_needed,
        payer = donor,
        space = 8 + DonationRecord::INIT_SPACE,
        seeds = [b"donation", wishlist.key().as_ref(), donor.key().as_ref()],
        bump
    )]
    pub donation_record: Account<'info, DonationRecord>,
    #[account(
        mut,
        seeds = [b"admin"],
        bump = config.bump
    )]
    pub config: Account<'info, AdminConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitInvoice<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        constraint = wishlist.org == signer.key() @ YanaPayError::Unauthorized
    )]
    pub wishlist: Account<'info, Wishlist>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(
        constraint = config.admin == admin.key() @ YanaPayError::Unauthorized
    )]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"admin"],
        bump = config.bump
    )]
    pub config: Account<'info, AdminConfig>,
    #[account(mut)]
    pub wishlist: Account<'info, Wishlist>,
    /// CHECK: Escrow PDA que tiene los fondos
    #[account(
        mut,
        seeds = [b"escrow", wishlist.key().as_ref()],
        bump = wishlist.escrow_bump
    )]
    pub escrow_vault: SystemAccount<'info>,
    /// CHECK: Wallet de la ONG que recibe los fondos
    #[account(
        mut,
        constraint = org_profile.wallet == org_wallet.key() @ YanaPayError::Unauthorized
    )]
    pub org_wallet: SystemAccount<'info>,
    #[account(
        mut,
        constraint = org_profile.wallet == wishlist.org @ YanaPayError::Unauthorized
    )]
    pub org_profile: Account<'info, OrgProfile>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RejectInvoice<'info> {
    #[account(
        constraint = config.admin == admin.key() @ YanaPayError::Unauthorized
    )]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"admin"],
        bump = config.bump
    )]
    pub config: Account<'info, AdminConfig>,
    #[account(mut)]
    pub wishlist: Account<'info, Wishlist>,
}
