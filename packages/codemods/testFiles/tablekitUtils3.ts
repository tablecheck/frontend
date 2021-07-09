import { Spacing } from '@tablekit/theme';
import { css as utilCss, variant, MediaQueryPropType } from '@tablekit/utils';
import { css as emotionCss } from '@emotion/react';
import { css } from '@emotion/react';

function someUtil() {
  return () => 12;
}

type t2 = MediaQueryPropType;

const staticStyles = css`
  color: blue;
  margin: 12px;
  padding: ${Spacing.L1};
`;

const staticStyles2 = emotionCss`
  color: blue;
  margin: 12px;
  padding: ${Spacing.L1};
`;

export const transition = utilCss`
  transition: 120ms ease-in-out;
  ${(props) => {
    return '';
  }}
`;

const interpolatedStyles = utilCss`
  color: ${({ theme, ...props }) => theme.colors.primary};
  color: ${(props2) => props2.theme.colors.primary};
  color: ${() => (true ? '12px' : '0px')};
  background-color: ${someUtil()};
  ${variant({ prop: 'test', variants: {} })};
  ${variant({ prop: () => 'test', variants: {} })};
  ${variant({
    prop: () => ({
      'min-width: 1200px': 'test'
    }),
    variants: {}
  })};${variant({
  prop: {
    'min-width: 1200px': 'test'
  },
  variants: {}
})};
  margin: 12px;
  padding: ${Spacing.L1};
`;

const testC = ({ theme, ...props }) => {
  const styles = utilCss`
    color: ${({ theme }) => theme.colors.primary};
  `({ theme, ...props });
  const test = theme.emotionCss.other;
  return styles;
};

function test({ theme, ...props }) {
  const styles = utilCss`
    color: ${({ theme }) => theme.colors.primary};
  `({ theme, ...props });
  const test = theme.emotionCss.other;
  return styles;
}

function test2(props) {
  const styles = utilCss`
      color: ${({ theme }) => theme.colors.primary};
      color: ${({ isTrue, theme }) => (isTrue ? theme.colors.primary : 'blue')};
      color: ${({ red, blue, green }) => `rgb(${red}, ${blue}, ${green})`};
      color: ${({ red, blue, green }) =>
        'rgb(' + red + ', ' + blue + ', ' + green + ')'};
      margin: ${({ spacing, isSmall, other }) => {
        if (isSmall) return 0;
        switch (spacing) {
          case 'small':
            return 6;
          case 'regular':
            return 12;
        }
        return 18;
      }};
    `(props);
  const test = props.theme.emotionCss.other;
  return styles;
}

function test3({ isTrue, theme, red, blue, green, spacing, isSmall }) {
  const styles = utilCss`
    color: ${({ isTrue, theme }) => (isTrue ? theme.colors.primary : 'blue')};
    color: ${({ red, blue, green }) => `rgb(${red}, ${blue}, ${green})`};
    margin: ${({ spacing, isSmall }) => {
      if (isSmall) return 0;
      switch (spacing) {
        case 'small':
          return 6;
        case 'regular':
          return 12;
      }
      return 18;
    }};
  `({ isTrue, theme, red, blue, green, spacing, isSmall });
  const test = theme.emotionCss.other;
  return styles;
}

function test4({ theme, ...props }) {
  const styles = utilCss`
    color: ${({ theme }) => theme.colors.primary};
  `({ theme });
  const test = props.theme.emotionCss.other;
  return styles;
}

const test5 = ({ spacingMax, isSmall, ...props }) =>
  utilCss`
    margin: ${({ spacing, isSmall, other }) => {
      if (isSmall) return 0;
      switch (spacing) {
        case 'small':
          return 6;
        case 'regular':
          return 12;
      }
      return 18;
    }};
  `({ spacing: spacingMax, isSmall, ...props });
