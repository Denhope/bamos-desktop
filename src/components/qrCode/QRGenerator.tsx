import QRCode from 'qrcode.react';
import React, { useEffect, useState } from 'react';

const QRGenerator = (props: {
  valueString: string;
  onReady: (url: string | null) => void;
}) => {
  const { valueString, onReady } = props;
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef) {
      canvasRef.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          onReady(url);
        } else {
          onReady(null);
        }
      });
    }
  }, [canvasRef]);

  useEffect(() => {
    const canvas = document.getElementById(`qrGenerator-${valueString}`);
    if (canvas instanceof HTMLCanvasElement) {
      setCanvasRef(canvas);
    }
  }, [valueString]);

  return (
    <>
      <div style={{ display: 'none' }}>
        <QRCode
          id={`qrGenerator-${valueString}`}
          value={valueString}
          renderAs="canvas"
          includeMargin={true}
          size={128}
          imageSettings={{
            src: 'path/to/image.png',
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>
    </>
  );
};

export default QRGenerator;
