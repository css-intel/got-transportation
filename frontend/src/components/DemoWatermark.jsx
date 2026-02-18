import { useMvp } from '../context/MvpContext';

export default function DemoWatermark() {
  const { mvpPaid } = useMvp();

  if (mvpPaid) return null;

  return (
    <div className="watermark-overlay">
      <div className="watermark-text">
        Demo Version – Awaiting Approval Payment<br />
        Demo Version – Awaiting Approval Payment<br />
        Demo Version – Awaiting Approval Payment
      </div>
    </div>
  );
}
