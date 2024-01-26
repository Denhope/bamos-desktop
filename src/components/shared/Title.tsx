import React, { FC } from 'react';
export type ITitleProps = {
  title: string;
};

const Title: FC<ITitleProps> = ({ title }) => {
  return <h2 className="text-xl uppercase">{title}</h2>;
};

export default Title;
