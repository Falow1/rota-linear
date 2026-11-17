import { Link } from "react-router";
import { Icon } from "../ui/icons";

export function NotFound() {
  return (
    <div className="page narrow center-page">
      <span className="lost" aria-hidden="true">
        <Icon name="route" size={64} />
      </span>
      <h1>Essa rota não existe</h1>
      <p className="muted">O endereço pode estar incompleto ou a página mudou de lugar.</p>
      <Link to="/" className="btn primary mt-16">
        Voltar ao início
      </Link>
    </div>
  );
}
