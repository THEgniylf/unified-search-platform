import { listMyFavourPostByPageUsingPost } from '@/services/backend/postFavourController';
import { listPostVoByPageUsingPost } from '@/services/backend/postController';
import { history } from '@umijs/max';
import {
  Avatar,
  Card,
  Empty,
  Segmented,
  Skeleton,
  Tag,
  Typography,
  Button,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  StarOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import React, { useState, useEffect, useCallback } from 'react';

const { Title, Text, Paragraph } = Typography;

const PAGE_SIZE = 10;

interface PostItem {
  id?: string;
  title?: string;
  content?: string;
  tagList?: string[];
  thumbNum?: number;
  favourNum?: number;
  createTime?: string;
}

const PostCard: React.FC<{ post: PostItem; onClick: () => void }> = ({ post, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: 16,
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background 0.2s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Title level={5} style={{ margin: 0, color: '#1677ff' }}>
            {post.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {post.createTime?.slice(0, 10)}
          </Text>
        </div>
        {post.content && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.6 }}
          >
            {post.content}
          </Paragraph>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {post.tagList?.slice(0, 3).map((tag) => (
            <Tag key={tag} color="blue" style={{ margin: 0 }}>
              {tag}
            </Tag>
          ))}
          <Tag style={{ margin: 0 }}>
            👍 {post.thumbNum ?? 0}
          </Tag>
          <Tag style={{ margin: 0 }}>
            ⭐ {post.favourNum ?? 0}
          </Tag>
        </div>
      </div>
      <ArrowRightOutlined style={{ color: '#ccc', marginTop: 6 }} />
    </div>
  </div>
);

const MyFavours: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMyFavourPostByPageUsingPost({
        current: 1,
        pageSize: PAGE_SIZE,
      });
      setPosts(res.data?.records ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <Card bordered={false}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card bordered={false} style={{ textAlign: 'center', padding: 40 }}>
        <Empty description="还没有收藏任何帖子">
          <Button type="primary" onClick={() => history.push('/search')}>
            去搜索
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Card bordered={false}>
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onClick={() => history.push(`/post/detail/${p.id}`)}
        />
      ))}
    </Card>
  );
};

const MyPosts: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPostVoByPageUsingPost({
        current: 1,
        pageSize: PAGE_SIZE,
        sortField: 'createTime',
        sortOrder: 'descend',
      });
      setPosts(res.data?.records ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <Card bordered={false}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card bordered={false} style={{ textAlign: 'center', padding: 40 }}>
        <Empty description="还没有发布过帖子">
          <Button type="primary" onClick={() => history.push('/post/add')}>
            发布第一个帖子
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Card bordered={false}>
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onClick={() => history.push(`/post/detail/${p.id}`)}
        />
      ))}
    </Card>
  );
};

const UserCenterPage: React.FC = () => {
  const { initialState } = (() => {
    try {
      return require('@umijs/max').useModel('@@initialState');
    } catch {
      return { initialState: undefined };
    }
  })();

  const currentUser = (initialState as any)?.currentUser;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 48px' }}>
      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {currentUser?.userAvatar ? (
            <Avatar src={currentUser.userAvatar} size={72} />
          ) : (
            <Avatar icon={<UserOutlined />} size={72} />
          )}
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {currentUser?.userName ?? '未登录'}
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {currentUser?.userRole === 'admin' ? '管理员' : '普通用户'}
            </Text>
          </div>
        </div>
      </Card>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Tabs
          items={[
            {
              key: 'favour',
              label: (
                <span>
                  <StarOutlined /> 我的收藏
                </span>
              ),
              children: <MyFavours />,
            },
            {
              key: 'post',
              label: (
                <span>
                  <FileTextOutlined /> 我的帖子
                </span>
              ),
              children: <MyPosts />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default UserCenterPage;
