import { color, COLORS } from '@tablekit/theme';

const t1 = (props) => css`
  color: ${color('secondary')(props)};
`;

const t2 = (props) => {
  return css`
    color: ${color('secondary')(props)};
  `;
};

function getColor(props) {
  let borderColor = 'blue';
  if (props.isInvalid) {
    borderColor = color('danger')(props);
  }
  return borderColor;
}

export const alertClassicTheme = {
  [ALERT_APPEARANCES.INFO]: {
    iconColor: color('iconFill')
  },
  actionBtnColor: color('primary'),
  boxShadowColor: COLORS.GRAY_TRANSLUCENT.L1,
  closeButton: {
    color: color('iconFill')
  }
};

export const LoadingIndicator = () => {
  const theme = useTheme();
  return <Spinner color={color('secondary')({ theme })} />;
};

const result = {
  colors: {
    danger: color('danger')(safeTheme)
  }
};

type PropsType1 = {
  color?: string | Function;
};

interface PropsType2 {
  color?: string | Function;
}
