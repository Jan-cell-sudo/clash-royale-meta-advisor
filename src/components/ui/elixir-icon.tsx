interface ElixirIconProps {
  className?: string;
  size?: number;
}

export const ElixirIcon = ({ className = "", size = 16 }: ElixirIconProps) => {
  return (
    <img 
      src="/lovable-uploads/583e5274-698c-4906-9146-0a4aa274b924.png" 
      alt="Elixir" 
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    />
  );
};