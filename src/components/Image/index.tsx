import { Image, ImageProps } from 'antd';
import { getImageUrl } from '@/utils'

export default ({ src, ...props }: ImageProps) => {
  let finallySrc = src || '';
  finallySrc = getImageUrl(src)
  return <Image
    // fallback="https://picsum.photos/200/200?text=无图"
    src={finallySrc}
    {...props}
  />;
};
