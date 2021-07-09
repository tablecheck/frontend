import {
  COLORS as BASE,
  color as colorResolver,
  typography,
  DEPTH,
  SPACING,
  Z_INDICES,
  SIZES,
  FIELD_HEIGHTS,
  useTypography
} from '@tablekit/theme';
import { CLASSIC_COLORS, COLORS } from '@tablekit/other';
import { SizeType } from '@tablekit/theme/types';
import { OtherType } from '@tablekit/theme/lib/types';
const TYPOGRAPHY = 'something about type';

const Spacing = 'true';

function calculateMinimumHeight(props) {
  const { minimumRows, theme } = props;
  const col = colorResolver('blue')({ theme });
  const padding = parseFloat(SPACING.L3) * 2;
  const typographySettings = typography(props.font, 'L2')(props);
  const lineHeight = parseFloat(typographySettings.lineHeight);
  const font = useTypography('L1');
  return `${padding + lineHeight * minimumRows}px`;
}

const size: SizeType = SIZES.XXLARGE;
let size2: typeof SIZES;
let size3: keyof SIZES;
type sizeObj = {
  [key in SIZES]: string;
};
type sizeTypeA = $Values<typeof SIZES>[];

const theme = {
  backgroundActiveColor: (props: any) =>
    hexToRgba(colorResolver('primary2')(props), 0.2)
};

export const EventPreview = styled.div`
  border-style: dashed;
  border-width: 1px;
  border-color: ${colorResolver('border')};
  border-color: ${colorResolver('border')()};
  border-color: ${(props) => colorResolver('border')(props)};
  border-color: ${({ theme }) => colorResolver('border')({ theme })};
  border-color: ${({ ...props }) => colorResolver('border')({ ...props })};
  border-color: ${(props) => colorResolver('border')({ ...props })};
  border-color: ${(props) => {
    const { color } = props;
    if (!color)
      return colorResolver('text')(props) || colorResolver('text')(props);
    if (typeof color === 'function') return color(props);
    return color;
  }};
  border-color: ${({ color }) => color || colorResolver('border')};
  border-color: ${(props) => props.color || colorResolver('border')};
  border-color: ${function test({ color }) {
    return color || colorResolver('border');
  }};
  border-color: ${({ color, theme }) =>
    color || colorResolver('border')({ theme })};
  padding: ${SPACING.L2};
  color: ${COLORS.GRAY.L6};
  background-color: ${BASE.GRAY.L6};
  margin: ${SPACING.L2} 0;
  ${typography('L1')};
  ${typography('L1')()};
  ${typography('L1', 'L2', 'L3')()};
  ${(props) => {
    return typography(props.level, 'L1')().fieldValue;
  }};
  ${TYPOGRAPHY.EX};

  z-index: ${Z_INDICES.topnav};
  height: ${FIELD_HEIGHTS.SMALL};
`;

const EP = <EventPreview>Test</EventPreview>;
