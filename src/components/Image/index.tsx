import { Image, ImageProps } from 'antd';
import { getImageUrl } from '@/utils'
import NonePng from '@/assets/none.png'

export default ({ src, ...props }: ImageProps) => {
  let finallySrc = src || '';
  finallySrc = getImageUrl(src)
  return <Image
    fallback={NonePng}
    src={finallySrc}
    {...props}
  />;
};
