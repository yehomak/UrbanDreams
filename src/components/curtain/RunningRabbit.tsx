import './RunningRabbit.css';

/** The original Urban Dreams loader: a white rabbit hopping through a little cloud. Pure CSS. */
export function RunningRabbit() {
  return (
    <div className="rabbit-run" aria-hidden="true">
      <div className="rabbit" />
      <div className="rabbit-cloud" />
    </div>
  );
}
