import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} 全域信息聚合搜索平台 · Powered by Spring Boot + Elasticsearch + React`}
      links={[
        {
          key: 'github',
          title: (
            <>
              <GithubOutlined /> 项目源码
            </>
          ),
          href: 'https://github.com',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
