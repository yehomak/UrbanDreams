import './RunningRabbitLoading.css';

export const RunningRabbitLoading = () => {
    return (
        <div className="binky-container">
          <div className="bunny">
            <div className="body"></div>
            <div className="ear left"></div>
            <div className="ear right"></div>
            <div className="face">
              <div className="eye left"></div>
              <div className="eye right"></div>
              <div className="nose"></div>
              <div className="mouth"></div>
            </div>
            <div className="leg front"></div>
            <div className="leg back"></div>
            <div className="tail"></div>
          </div>
          <div className="shadow"></div>
        </div>
      );
};