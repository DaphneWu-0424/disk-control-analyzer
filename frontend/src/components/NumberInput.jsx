export default function NumberInput({
    label,
    value,
    onChange,
    step = 'any',
    min,
    max,
    disabled = false,
  }) {
    return (
      <label className="form-field">
        <span>{label}</span>
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    )
  }