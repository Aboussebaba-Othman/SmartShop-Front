export default function FormField({
    label,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder = '',
    min,
    max,
    step,
    disabled = false,
    ...props
}) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#333',
            }}>
                {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                {...props}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: error ? '1px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '0.25rem',
                    fontSize: '1rem',
                    backgroundColor: disabled ? '#f5f5f5' : 'white',
                    ...props.style,
                }}
            />
            {error && (
                <p style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#e74c3c'
                }}>
                    {error}
                </p>
            )}
        </div>
    );
}
