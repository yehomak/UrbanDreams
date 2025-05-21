import './RunningRabbitLoading.css';

export const RunningRabbitLoading = () => {
  return (
    <div className="loading-container">
      <div className="rabbit">
        {/* Rabbit animation will be created using CSS pseudo-elements */}
      </div>
      <div className="clouds"></div>
    </div>
  );
};