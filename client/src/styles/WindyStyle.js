const windyBg = {
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #a8edea 0%, #fed6e3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
};

const windyEffect = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
};

const loginBox = {
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
    padding: '2.5rem 2rem',
    maxWidth: '350px',
    width: '100%',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const registerBox = {
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
    padding: '2.5rem 2rem',
    maxWidth: '350px',
    width: '100%',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    borderRadius: '8px',
    border: '1px solid #b2bec3',
    fontSize: '1rem',
};

const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(90deg, #89f7fe 0%, #66a6ff 100%)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.10)',
    transition: 'background 0.3s',
};

const recoveryBox = {
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
    padding: '2.5rem 2rem',
    maxWidth: '350px',
    width: '100%',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const otpInputStyle = {
    width: '40px',
    height: '40px',
    margin: '0 5px',
    textAlign: 'center',
    fontSize: '1.2rem',
    borderRadius: '8px',
    border: '1px solid #b2bec3',
};



export { windyBg, windyEffect, loginBox, inputStyle, buttonStyle, registerBox, recoveryBox, otpInputStyle };