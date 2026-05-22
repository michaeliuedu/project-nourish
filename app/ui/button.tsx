import "./button.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button {...props} className={`button ${className ?? ""}`}>
      {children}
    </button>
  );
}
