import { getPostVoByIdUsingGet } from '@/services/backend/postController';
import { doThumbUsingPost } from '@/services/backend/postThumbController';
import { doPostFavourUsingPost } from '@/services/backend/postFavourController';
import { history, useParams } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Empty,
  message,
  Space,
  Tag,
  Typography,
  Skeleton,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  LikeOutlined,
  LikeFilled,
  StarOutlined,
  StarFilled,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import React, { useState, useEffect, useCallback } from 'react';

const { Title, Text } = Typography;

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<API.PostVO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [thumbLoading, setThumbLoading] = useState<boolean>(false);
  const [favourLoading, setFavourLoading] = useState<boolean>(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getPostVoByIdUsingGet({ id });
      setPost(res.data ?? null);
    } catch (error: any) {
      message.error('加载帖子失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleThumb = async () => {
    if (!id || !post) return;
    setThumbLoading(true);
    try {
      const res = await doThumbUsingPost({ postId: id });
      const count =
        typeof res.data === 'number'
          ? res.data
          : post.hasThumb
          ? (post.thumbNum ?? 1) - 1
          : (post.thumbNum ?? 0) + 1;
      setPost({
        ...post,
        hasThumb: !post.hasThumb,
        thumbNum: count,
      });
      message.success(post.hasThumb ? '已取消点赞' : '点赞成功');
    } catch (error: any) {
      message.error('操作失败，请先登录');
    } finally {
      setThumbLoading(false);
    }
  };

  const handleFavour = async () => {
    if (!id || !post) return;
    setFavourLoading(true);
    try {
      const res = await doPostFavourUsingPost({ postId: id });
      const count =
        typeof res.data === 'number'
          ? res.data
          : post.hasFavour
          ? (post.favourNum ?? 1) - 1
          : (post.favourNum ?? 0) + 1;
      setPost({
        ...post,
        hasFavour: !post.hasFavour,
        favourNum: count,
      });
      message.success(post.hasFavour ? '已取消收藏' : '收藏成功');
    } catch (error: any) {
      message.error('操作失败，请先登录');
    } finally {
      setFavourLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Skeleton active avatar paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <Empty description="帖子不存在或已被删除">
            <Button onClick={() => history.push('/post/list')}>返回列表</Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => history.goBack()}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Title level={2} style={{ marginBottom: 16 }}>
          {post.title}
        </Title>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            paddingBottom: 16,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {post.user?.userAvatar ? (
            <Avatar src={post.user.userAvatar} size={40} />
          ) : (
            <Avatar icon={<UserOutlined />} size={40} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15 }}>
              <Text strong>{post.user?.userName ?? '匿名用户'}</Text>
            </div>
            <div style={{ color: '#999', fontSize: 13, marginTop: 2 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {post.createTime}
            </div>
          </div>
        </div>

        {post.tagList && post.tagList.length > 0 && (
          <div style={{ marginBottom: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {post.tagList.map((tag) => (
              <Tag
                key={tag}
                color="blue"
                style={{ cursor: 'pointer', margin: 0 }}
                onClick={() => history.push(`/search?q=${encodeURIComponent(tag)}`)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        )}

        <div
          style={{
            fontSize: 16,
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: '16px 0',
            color: '#262626',
          }}
        >
          {post.content ?? <Empty description="暂无内容" />}
        </div>

        <Divider />

        <Space
          size={16}
          style={{ width: '100%', justifyContent: 'center', padding: '8px 0' }}
        >
          <Button
            type={post.hasThumb ? 'primary' : 'default'}
            size="large"
            icon={post.hasThumb ? <LikeFilled /> : <LikeOutlined />}
            onClick={handleThumb}
            loading={thumbLoading}
          >
            点赞 {post.thumbNum ?? 0}
          </Button>
          <Button
            type={post.hasFavour ? 'primary' : 'default'}
            size="large"
            icon={post.hasFavour ? <StarFilled /> : <StarOutlined />}
            onClick={handleFavour}
            loading={favourLoading}
          >
            收藏 {post.favourNum ?? 0}
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default PostDetailPage;
