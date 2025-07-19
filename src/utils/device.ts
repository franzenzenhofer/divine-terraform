// Device detection utilities

export function isMobile(): boolean {
  // Check if running on mobile device
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile user agents
  if (/android/i.test(userAgent)) return true;
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return true;
  if (/windows phone/i.test(userAgent)) return true;
  
  // Check for mobile screen size
  if (window.innerWidth <= 768) return true;
  
  // Check for touch support
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // Additional check for screen size to avoid false positives on touch laptops
    return window.innerWidth <= 1024;
  }
  
  return false;
}

export function isTablet(): boolean {
  const width = window.innerWidth;
  return width > 768 && width <= 1024 && isTouchDevice();
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

export function isSafari(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
}

export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}

export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

export function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2'));
  } catch (e) {
    return false;
  }
}

export function getOptimalTextureSize(): number {
  const isMobileDevice = isMobile();
  const pixelRatio = getDevicePixelRatio();
  
  if (isMobileDevice) {
    // Lower texture sizes for mobile
    return pixelRatio > 2 ? 1024 : 512;
  }
  
  // Higher texture sizes for desktop
  return pixelRatio > 1 ? 2048 : 1024;
}

export function getOptimalShadowMapSize(): number {
  const isMobileDevice = isMobile();
  
  if (isMobileDevice) {
    return 512;
  }
  
  return 2048;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isLandscape: boolean;
  pixelRatio: number;
  supportsWebGL2: boolean;
  optimalTextureSize: number;
  optimalShadowMapSize: number;
  maxTouchPoints: number;
}

export function getDeviceCapabilities(): DeviceCapabilities {
  return {
    isMobile: isMobile(),
    isTablet: isTablet(),
    isTouchDevice: isTouchDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isSafari: isSafari(),
    isLandscape: isLandscape(),
    pixelRatio: getDevicePixelRatio(),
    supportsWebGL2: supportsWebGL2(),
    optimalTextureSize: getOptimalTextureSize(),
    optimalShadowMapSize: getOptimalShadowMapSize(),
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
}

// Orientation change handler
export function onOrientationChange(callback: (isLandscape: boolean) => void): () => void {
  const handler = (): void => {
    callback(isLandscape());
  };
  
  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
}

// Viewport utilities
export function lockViewport(): void {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
  }
}

export function preventPullToRefresh(): void {
  let lastY = 0;
  
  document.addEventListener('touchstart', (e) => {
    lastY = e.touches[0].clientY;
  }, { passive: false });
  
  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].clientY;
    const scrollingUp = y > lastY;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    
    if (scrollingUp && scrollTop === 0) {
      e.preventDefault();
    }
    
    lastY = y;
  }, { passive: false });
}