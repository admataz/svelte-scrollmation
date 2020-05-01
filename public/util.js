const toHomeRatio = ({ homeScrollPos, scrollPosPx, startScrollPosPx }) =>
  (homeScrollPos - scrollPosPx) / (homeScrollPos - startScrollPosPx);

const toStartRatio = ({ homeScrollPos, scrollPosPx, startScrollPosPx }) =>
  (scrollPosPx - startScrollPosPx) / (homeScrollPos - startScrollPosPx);

const toEndRatio = ({ scrollPosPx, endScrollPosPx, homeScrollPos }) =>
  (scrollPosPx - endScrollPosPx) / (homeScrollPos - endScrollPosPx);

const toRangeRatio = ({ scrollPosPx, endScrollPosPx, startScrollPosPx }) =>
  (scrollPosPx - endScrollPosPx) / (startScrollPosPx - endScrollPosPx);

const fullRangePx = ({ endScrollPosPx, startScrollPosPx }) =>
  endScrollPosPx - startScrollPosPx;

const toHomePx = ({ homeScrollPos, scrollPosPx }) =>
  homeScrollPos - scrollPosPx;

const toEndPx = ({ endScrollPosPx, scrollPosPx }) =>
  endScrollPosPx - scrollPosPx;

const toStartPx = ({ startScrollPosPx, scrollPosPx }) =>
  startScrollPosPx - scrollPosPx;
