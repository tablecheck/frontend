import { css } from '@emotion/react';
import { getThemeValue } from '@tablekit/utils';
import { tooltipThemeNamespace, tooltipClassicTheme } from './themes';

export const TooltipPrimitive = styled.div`
  pointer-events: none;
  position: fixed;
`;

export const Tooltip = styled(TooltipPrimitive)`
  background-color: ${getThemeValue(
    `${tooltipThemeNamespace}.backgroundColor`,
    tooltipClassicTheme.backgroundColor
  )};
  color: ${getThemeValue(
    `${tooltipThemeNamespace}.textColor`,
    tooltipClassicTheme.textColor
  )};
  top: 0;
  left: 0;
  line-height: 16px;
  max-width: 240px;

  ${({ isSelected, theme }) => {
    if (isSelected) {
      return css`
        color: white;
        background-color: ${theme.colors.primary};
        &:hover {
          background-color: ${theme.colors.primary2};
        }
      `;
    }
    return '';
  }}
`;
