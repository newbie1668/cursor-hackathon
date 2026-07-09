/** Official Cursor 2D cube mark (from cursor.com/brand). */

const CUBE_DARK =
  "M924.213 422.328L806.122 354.147C802.329 351.956 797.653 351.956 793.861 354.147L675.775 422.328C672.588 424.17 670.617 427.572 670.617 431.257V568.738C670.617 572.423 672.583 575.829 675.775 577.667L793.866 645.847C797.659 648.038 802.335 648.038 806.127 645.847L924.218 577.667C927.405 575.824 929.376 572.423 929.376 568.738V431.257C929.376 427.572 927.41 424.165 924.218 422.328H924.213ZM916.799 436.768L802.801 634.219C802.029 635.547 799.994 635.006 799.994 633.463V504.178C799.994 501.596 798.612 499.207 796.373 497.906L684.41 433.265C683.081 432.494 683.622 430.459 685.165 430.459H913.162C916.398 430.459 918.422 433.967 916.805 436.774H916.799V436.768Z";

const CUBE_LIGHT =
  "M920.015 424.958L805.919 359.086C802.256 356.97 797.735 356.97 794.071 359.086L679.981 424.958C676.901 426.736 675 430.025 675 433.587V566.419C675 569.981 676.901 573.269 679.981 575.048L794.077 640.92C797.74 643.036 802.261 643.036 805.925 640.92L920.02 575.048C923.1 573.269 925.001 569.981 925.001 566.419V433.587C925.001 430.025 923.1 426.736 920.02 424.958H920.015ZM912.848 438.911L802.706 629.682C801.961 630.968 799.995 630.443 799.995 628.954V504.039C799.995 501.543 798.662 499.234 796.498 497.981L688.321 435.526C687.036 434.781 687.561 432.816 689.05 432.816H909.334C912.462 432.816 914.417 436.206 912.853 438.917H912.848V438.911Z";

interface CursorLogoProps {
  className?: string;
  title?: string;
}

/** Dark cube on transparent — for cream / light surfaces. */
export function CursorLogo({ className, title = "Cursor" }: CursorLogoProps) {
  return (
    <svg
      className={className}
      viewBox="600 300 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path fill="currentColor" d={CUBE_DARK} />
    </svg>
  );
}

/** App-icon style: cream cube on ink rounded square. */
export function CursorAppIcon({ className, title = "Cursor" }: CursorLogoProps) {
  return (
    <svg
      className={className}
      viewBox="600 300 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect x="600" y="300" width="400" height="400" rx="88" fill="#14120B" />
      <path fill="#EDECEC" d={CUBE_LIGHT} />
    </svg>
  );
}
