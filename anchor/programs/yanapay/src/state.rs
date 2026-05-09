use anchor_lang::prelude::*;

// ── Enums ────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum DonorType {
    Natural,   // Persona Natural (DNI)
    Juridica,  // Persona Jurídica / Empresa (RUC)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum OrgStatus {
    Pending,   // Pendiente de validación HOTL
    Validated, // Validada por admin
    Rejected,  // Rechazada por admin
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum WishlistStatus {
    Active,    // Aceptando donaciones
    Funded,    // Meta alcanzada, pendiente de factura
    Completed, // Admin liberó fondos
    Cancelled, // Cancelada por la ONG
}

// ── Accounts ─────────────────────────────────────────────────────────────────

/// Configuración global del programa. PDA: [b"admin"]
#[account]
#[derive(InitSpace)]
pub struct AdminConfig {
    pub admin: Pubkey,
    pub total_orgs: u32,
    pub total_donors: u32,
    pub total_donated_lamports: u64,
    pub bump: u8,
}

/// Perfil de donante (Natural o Jurídica). PDA: [b"donor", wallet]
#[account]
#[derive(InitSpace)]
pub struct DonorProfile {
    pub wallet: Pubkey,
    pub donor_type: DonorType,
    #[max_len(64)]
    pub full_name: String,
    /// DNI (8 dígitos) para Natural, RUC (11 dígitos) para Jurídica
    #[max_len(11)]
    pub dni_ruc: String,
    /// Solo para Persona Jurídica
    #[max_len(64)]
    pub company_name: String,
    /// Representante legal para Persona Jurídica
    #[max_len(64)]
    pub legal_rep: String,
    pub registered_at: i64,
    pub total_donated: u64,
    pub donation_count: u32,
    pub bump: u8,
}

/// Perfil de ONG / Organización. PDA: [b"org", wallet]
#[account]
#[derive(InitSpace)]
pub struct OrgProfile {
    pub wallet: Pubkey,
    #[max_len(64)]
    pub org_name: String,
    #[max_len(11)]
    pub ruc: String,
    #[max_len(256)]
    pub description: String,
    #[max_len(200)]
    pub logo_uri: String,
    #[max_len(200)]
    pub banner_uri: String,
    /// JSON serializado con redes sociales: {"web":"...","ig":"...","fb":"..."}
    #[max_len(256)]
    pub social_media: String,
    pub status: OrgStatus,
    pub validated_at: i64,
    pub registered_at: i64,
    pub total_received: u64,
    pub wishlist_count: u64,
    pub bump: u8,
}

/// Lista de deseos de una ONG. PDA: [b"wishlist", org, &id.to_le_bytes()]
#[account]
#[derive(InitSpace)]
pub struct Wishlist {
    pub org: Pubkey,
    #[max_len(64)]
    pub title: String,
    #[max_len(256)]
    pub description: String,
    pub target_amount: u64,
    pub raised_amount: u64,
    pub donor_count: u32,
    pub status: WishlistStatus,
    pub created_at: i64,
    pub funded_at: i64,
    pub completed_at: i64,
    /// URI a la factura/boleta (IPFS / Arweave), cargada por la ONG
    #[max_len(200)]
    pub invoice_uri: String,
    /// ID secuencial dentro de la org (0-indexed)
    pub id: u64,
    pub escrow_bump: u8,
    pub bump: u8,
}

/// Registro de donación por (wishlist, donante). PDA: [b"donation", wishlist, donor]
#[account]
#[derive(InitSpace)]
pub struct DonationRecord {
    pub donor: Pubkey,
    pub wishlist: Pubkey,
    pub amount: u64,
    pub donated_at: i64,
    pub bump: u8,
}

// ── Instruction Params ────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterDonorParams {
    pub donor_type: DonorType,
    pub full_name: String,
    pub dni_ruc: String,
    pub company_name: String,
    pub legal_rep: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterOrgParams {
    pub org_name: String,
    pub ruc: String,
    pub description: String,
    pub logo_uri: String,
    pub banner_uri: String,
    pub social_media: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateWishlistParams {
    pub title: String,
    pub description: String,
    pub target_amount: u64,
}
