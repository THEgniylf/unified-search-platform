import { searchPostVoByPageUsingPost } from '@/services/backend/postController';
import { history } from '@umijs/max';
import {
  SearchOutlined,
  ThunderboltOutlined,
  StarOutlined,
  LikeOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { Input, Card, Typography, Tag, Pagination, Skeleton, Empty, Tooltip, Badge } from 'antd';
import React, { useState, useCallback, useEffect } from 'react';

const { Title, Text, Paragraph } = Typography;

const HOT_TAGS = ['Java', '前端', 'React', 'Spring Boot', 'MySQL', 'Redis', '算法', '系统设计', 'Vue', 'ES'];

const HIGHLIGHT_RE = /__(.+?)__/g;

const highlightText = (text?: string, keyword?: string) => {
  if (!text) return null;
  const clean = text.replace(HIGHLIGHT_RE, '$1');
  if (!keyword) return clean;
  const kw = keyword.trim();
  if (!kw) return clean;
  const idx = clean.toLowerCase().indexOf(kw.toLowerCase());
  if (idx < 0) return clean;
  return (
    <>
      {clean.slice(0, idx)}
      <mark style={{ background: '#fff1b8', padding: '0 2px', borderRadius: 2 }}>
        {clean.slice(idx, idx + kw.length)}
      </mark>
      {clean.slice(idx + kw.length)}
    </>
  );
};

const SearchPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<API.PostVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);

  const doSearch = useCallback(
    async (keyword: string, page = 1, size = 10) => {
      if (!keyword.trim()) {
        setHasSearched(false);
        setResults([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      const start = Date.now();
      try {
        const res = await searchPostVoByPageUsingPost({
          searchText: keyword,
          current: page,
          pageSize: size,
          sortField: 'createTime',
          sortOrder: 'descend',
        });
        setResults(res.data?.records ?? []);
        setTotal(res.data?.total ?? 0);
        setCurrent(page);
        setPageSize(size);
        setHasSearched(true);
        setElapsed((Date.now() - start) / 1000);
      } catch (error: any) {
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearch = () => {
    doSearch(searchText, 1, pageSize);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePaginationChange = (page: number, size: number) => {
    doSearch(searchText, page, size);
  };

  const goToDetail = (id: string) => {
    history.push(`/post/detail/${id}`);
  };

  const searchByTag = (tag: string) => {
    setSearchText(tag);
    doSearch(tag, 1, pageSize);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearchText(q);
      doSearch(q, 1, pageSize);
    }
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 130px)' }}>
      <div
        style={{
          background: hasSearched
            ? 'linear-gradient(180deg, #e6f4ff 0%, #ffffff 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: hasSearched ? '24px 24px 32px' : '120px 24px 80px',
          transition: 'all 0.4s ease',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {!hasSearched && (
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <ThunderboltOutlined style={{ fontSize: 56, color: '#fff' }} />
              <Title level={1} style={{ color: '#fff', marginTop: 24, marginBottom: 8 }}>
                全域信息聚合搜索
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                基于 Elasticsearch 的分布式聚合搜索平台
              </Text>
            </div>
          )}

          <Input.Search
            size="large"
            placeholder={hasSearched ? '搜索更多内容...' : '输入关键词，探索你想要的信息'}
            enterButton={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <SearchOutlined />
                搜索
              </span>
            }
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            onKeyDown={handleKeyDown}
            allowClear
            autoFocus
            style={{
              boxShadow: hasSearched ? '0 2px 8px rgba(0,0,0,0.08)' : '0 8px 24px rgba(0,0,0,0.15)',
              borderRadius: 8,
            }}
          />

          {!hasSearched && (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
                <FireOutlined style={{ marginRight: 6 }} />
                热门搜索
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {HOT_TAGS.map((tag) => (
                  <Tag.CheckableTag
                    key={tag}
                    checked={false}
                    onChange={() => searchByTag(tag)}
                    style={{
                      padding: '4px 14px',
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 16,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </Tag.CheckableTag>
                ))}
              </div>
            </div>
          )}

          {hasSearched && !loading && (
            <div style={{ marginTop: 16, color: '#555', fontSize: 13 }}>
              找到 <Text strong>{total}</Text> 条相关结果，用时{' '}
              <Text strong>{elapsed.toFixed(3)}</Text> 秒
            </div>
          )}
        </div>
      </div>

      {hasSearched && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 48px' }}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {loading ? (
              <div style={{ padding: '24px 0' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ marginBottom: 24 }}>
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => goToDetail(item.id as string)}
                    style={{
                      padding: '16px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
                        {highlightText(item.title, searchText)}
                      </Title>
                    </div>

                    {item.content && (
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.7 }}
                      >
                        {highlightText(item.content, searchText)}
                      </Paragraph>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.tagList?.slice(0, 4).map((tag) => (
                          <Tag key={tag} color="blue" style={{ margin: 0 }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 14, color: '#888', fontSize: 13 }}>
                        <Tooltip title="收藏">
                          <span>
                            <StarOutlined style={{ marginRight: 3 }} />
                            {item.favourNum ?? 0}
                          </span>
                        </Tooltip>
                        <Tooltip title="点赞">
                          <span>
                            <LikeOutlined style={{ marginRight: 3 }} />
                            {item.thumbNum ?? 0}
                          </span>
                        </Tooltip>
                        {item.createTime && <Text type="secondary">{item.createTime.slice(0, 10)}</Text>}
                      </div>
                    </div>
                  </div>
                ))}

                {total > pageSize && (
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Pagination
                      current={current}
                      pageSize={pageSize}
                      total={total}
                      showSizeChanger
                      showQuickJumper
                      onChange={handlePaginationChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      没有找到关于 "<Text strong>{searchText}</Text>" 的结果
                    </span>
                  }
                />
                <div style={{ marginTop: 16, color: '#999', fontSize: 13 }}>
                  试试其他关键词，或发布新帖子
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
