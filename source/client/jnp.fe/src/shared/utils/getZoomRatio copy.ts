export const getZoomRatio = () => {
  const deviceWidth = window.screen.width;
  const zoom = deviceWidth / 1920;
  return zoom;
};
