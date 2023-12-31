import bowser from 'bowser';

export interface Device {
  flag: string;
  name: string;
  version: string;
}

export const getDeviceInfo = (): Device => {
  const ua = navigator.userAgent;
  const browser = bowser.getParser(ua);
  let flag;

  if (browser.satisfies({ chrome: '>=0', chromium: '>=0' })) flag = 'chrome';
  else if (browser.satisfies({ firefox: '>=0' })) flag = 'firefox';
  else if (browser.satisfies({ safari: '>=0' })) flag = 'safari';
  else if (browser.satisfies({ opera: '>=0' })) flag = 'opera';
  else if (browser.satisfies({ 'microsoft edge': '>=0' })) flag = 'edge';
  else flag = 'unknown';

  const device: Device = {
    flag: flag,
    name: browser.getBrowserName(),
    version: browser.getBrowserVersion()
  };

  return device;
};
