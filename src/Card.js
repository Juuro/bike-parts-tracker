import "./Card.scss";

function Card(props) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="subheading">{props.part}</span>
      </div>
      <div className="card-body">
        <div className="card-body-left">
          <h3 className="card-heading">{props.name}</h3>
        </div>
        <div className="card-body-right">
          <ul>
            <li>
              <span className="weight">{props.weight} g</span>
            </li>
            <li>
              <span className="purchase-price">{props.purchasePrice} €</span>
            </li>
            <li>
              <span className="purchase-date">{props.purchaseDate}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Card;
