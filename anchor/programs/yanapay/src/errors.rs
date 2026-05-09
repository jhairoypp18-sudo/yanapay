use anchor_lang::prelude::*;

#[error_code]
pub enum YanaPayError {
    #[msg("No autorizado: se requiere rol de administrador")]
    Unauthorized,
    #[msg("La organización ya ha sido registrada")]
    OrgAlreadyRegistered,
    #[msg("El donante ya ha sido registrado")]
    DonorAlreadyRegistered,
    #[msg("La organización no ha sido validada por el administrador")]
    OrgNotValidated,
    #[msg("La organización ha sido rechazada")]
    OrgRejected,
    #[msg("La lista de deseos no está activa")]
    WishlistNotActive,
    #[msg("La lista de deseos ya alcanzó su meta")]
    WishlistAlreadyFunded,
    #[msg("Monto inválido: debe ser mayor a cero")]
    InvalidAmount,
    #[msg("Monto inválido: excede el objetivo restante")]
    AmountExceedsTarget,
    #[msg("La factura ya fue enviada para esta lista")]
    InvoiceAlreadySubmitted,
    #[msg("No hay fondos en el vault para liberar")]
    NoFundsToRelease,
    #[msg("La lista de deseos no ha alcanzado su meta aún")]
    WishlistNotFunded,
    #[msg("El RUC debe tener 11 dígitos")]
    InvalidRuc,
    #[msg("El DNI debe tener 8 dígitos")]
    InvalidDni,
    #[msg("El nombre no puede estar vacío")]
    EmptyName,
    #[msg("El monto objetivo debe ser mayor a cero")]
    InvalidTargetAmount,
    #[msg("URI de factura vacía")]
    EmptyInvoiceUri,
    #[msg("El programa ya fue inicializado")]
    AlreadyInitialized,
}
