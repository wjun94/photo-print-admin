import { Image, ImageProps } from 'antd';
import { getImageUrl } from '@/utils'

export default ({ src, ...props }: ImageProps) => {
  let finallySrc = src || '';
  finallySrc = getImageUrl(src)
  return <Image
    src={finallySrc}
    {...props}
  />;
};
