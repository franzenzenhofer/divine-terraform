import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress?: number;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress = 0, message = 'Initializing...' }) => {
  const [internalProgress, setInternalProgress] = useState(progress);
  const [loadingText, setLoadingText] = useState(message);

  useEffect(() => {
    if (progress > 0) {
      setInternalProgress(progress);
    }
    if (message) {
      setLoadingText(message);
    }
  }, [progress, message]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <svg className="loading-logo" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#4fc3f7', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#29b6f6', stopOpacity: 1 }} />
            </linearGradient>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#4fc3f7', stopOpacity: 0.2 }} />
            </radialGradient>
          </defs>
          
          {/* Outer rotating rings */}
          <g className="rotating-rings">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="2"
              opacity="0.3"
              strokeDasharray="10 5"
            />
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="3"
              opacity="0.5"
              strokeDasharray="15 5"
            />
            <circle
              cx="60"
              cy="60"
              r="30"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="4"
              opacity="0.7"
            />
          </g>
          
          {/* Center sphere */}
          <circle cx="60" cy="60" r="20" fill="url(#centerGradient)" />
          
          {/* Divine symbol */}
          <path
            d="M60 45 L65 55 L75 55 L67 62 L70 72 L60 65 L50 72 L53 62 L45 55 L55 55 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </svg>
        
        <h1 className="loading-title">Divine Terraform</h1>
        <p className="loading-subtitle">Shape Worlds • Guide Civilizations</p>
        <p className="loading-version">v1.2.0</p>
        
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div
              className="loading-progress-fill"
              style={{ width: `${internalProgress}%` }}
            />
          </div>
          <p className="loading-progress-text">{loadingText}</p>
        </div>
        
        <div className="loading-tips">
          <p className="loading-tip">
            Tip: Use your divine powers wisely - faith is a precious resource!
          </p>
        </div>
      </div>
      
      <style>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-content {
          text-align: center;
          max-width: 400px;
          padding: 2rem;
        }
        
        .loading-logo {
          width: 120px;
          height: 120px;
          margin-bottom: 2rem;
        }
        
        .rotating-rings {
          animation: rotate 20s linear infinite;
          transform-origin: center;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #4fc3f7, #29b6f6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .loading-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
        }
        
        .loading-version {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 2.5rem;
          font-family: monospace;
        }
        
        .loading-progress-container {
          margin-bottom: 2rem;
        }
        
        .loading-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .loading-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4fc3f7, #29b6f6);
          border-radius: 3px;
          transition: width 0.5s ease;
          box-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
        }
        
        .loading-progress-text {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .loading-tips {
          margin-top: 3rem;
        }
        
        .loading-tip {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .loading-title {
            font-size: 2rem;
          }
          
          .loading-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;