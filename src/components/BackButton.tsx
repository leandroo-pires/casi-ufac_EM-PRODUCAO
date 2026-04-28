import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BackButton = ({ to, label = "Voltar" }: { to?: string; label?: string }) => {
  const navigate = useNavigate();
  const handle = () => {
    if (to) navigate(to);
    else if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
  return (
    <Button
      onClick={handle}
      variant="outline"
      size="sm"
      className="mb-4 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-display uppercase text-xs tracking-widest group"
    >
      <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
      {label}
    </Button>
  );
};
