import { listPostVoByPageUsingPost } from '@/services/backend/postController';
import { history } from '@umijs/max';
import {
  LikeOutlined,
  StarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Card, Input, Tag, Button, Empty, Skeleton, Segmented, Row, Col, Tooltip } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';

type SortType = 'hot' | 'thumbNum' | 'favourNum' | 'createTime';

const SORT_OPTIONS: { label: string; value: SortType; icon: React.ReactNode }[] = [
  { label: '最新', value: 'createTime', icon: <ClockCircleOutlined /> },
  { label: '最热', value: 'hot', icon: <FireOutlined /> },
  { label: '最多赞', value: 'thumbNum', icon: <LikeOutlined /> },
  { label: '最多收藏', value: 'favourNum', icon: <StarOutlined /> },
];

const PostListPage: React.FC = () => {
  const [posts, setPosts] = useState<API.PostVO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortType>('createTime');
  const [keyword, setKeyword] = useState('');
  const [current, setCurrent] = useState(1);
  const pageSize = 12;

  const fetchPosts = useCallback(
    async (page = 1, sort: SortType = sortField, kw = keyword) => {
      setLoading(true);
      try {
        const res = await listPostVoByPageUsingPost({
          current: page,
          pageSize,
          sortField: sort === 'hot' ? 'thumbNum' : sort,
          sortOrder: 'descend',
          title: kw || undefined,
        });
        setPosts(res.data?.records ?? []);
        setTotal(res.data?.total ?? 0);
        setCurrent(page);
      } catch (error: any) {
      } finally {
        setLoading(false);
      }
    },
    [sortField, keyword],
  );

  useEffect(() => {
    fetchPosts(1);
  }, [sortField]);

  const handleSortChange = (value: SortType) => {
    setSortField(value);
  };

  const handleSearch = () => {
    fetchPosts(1, sortField, keyword);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="搜索帖子标题"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 240 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
          />
          <Segmented
            value={sortField}
            onChange={(v) => handleSortChange(v as SortType)}
            options={SORT_OPTIONS.map((o) => ({
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {o.icon}
                  {o.label}
                </span>
              ),
              value: o.value,
            }))}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => history.push('/post/add')}
        >
          发布帖子
        </Button>
      </div>

      {loading ? (
        <Row gutter={[24, 24]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} xs={24} md={12} lg={8}>
              <Card bordered={false} style={{ borderRadius: 12, minHeight: 200 }}>
                <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : posts.length > 0 ? (
        <Row gutter={[24, 24]}>
          {posts.map((post) => (
            <Col
              key={post.id}
              xs={24}
              md={12}
              lg={8}
              onClick={() => history.push(`/post/detail/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <Card
                hoverable
                bordered={false}
                style={{
                  borderRadius: 12,
                  height: '100%',
                  transition: 'transform 0.2s',
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ marginBottom: 12 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      color: '#1f1f1f',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.title}
                  </h3>
                </div>

                {post.content && (
                  <p
                    style={{
                      color: '#666',
                      fontSize: 14,
                      lineHeight: 1.6,
                      marginBottom: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.content}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, minHeight: 28 }}>
                  {post.tagList?.slice(0, 3).map((tag) => (
                    <Tag key={tag} color="blue" style={{ margin: 0 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0',
                    color: '#999',
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Tooltip title="点赞">
                      <span>
                        <LikeOutlined style={{ marginRight: 3 }} />
                        {post.thumbNum ?? 0}
                      </span>
                    </Tooltip>
                    <Tooltip title="收藏">
                      <span>
                        <StarOutlined style={{ marginRight: 3 }} />
                        {post.favourNum ?? 0}
                      </span>
                    </Tooltip>
                  </div>
                  <span>{post.createTime?.slice(0, 10)}</span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <Empty
            description={<span>暂无帖子</span>}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push('/post/add')}>
              发布第一个帖子
            </Button>
          </Empty>
        </div>
      )}

      {total > pageSize && posts.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 32, color: '#999' }}>
          还有 {total - current * pageSize > 0 ? total - current * pageSize : 0} 条内容，继续浏览或发布新帖吧～
        </div>
      )}
    </div>
  );
};

export default PostListPage;
