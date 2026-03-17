export default function SearchField({ value, onChange, placeholder, name = 'busca', className = 'search-input' }) {
    return (
        <input
            name={name}
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
}
