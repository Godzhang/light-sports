const u = navigator.userAgent;
export const isMobile = !!u.match(/AppleWebKit.*Mobile.*/);
export const isWeixin = u.toLowerCase().includes("micromessenger");
