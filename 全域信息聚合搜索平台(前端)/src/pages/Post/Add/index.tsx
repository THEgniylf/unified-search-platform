import { addPostUsingPost } from '@/services/backend/postController';
import { history } from '@umijs/max';
import { Button, Card, Form, Input, Select, Space, message, Typography } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

const { TextArea } = Input;
const { Text } = Typography;

const SUGGESTED_TAGS = [
  'Java', '前端', '后端', '算法', 'Spring Boot', 'MySQL', 'Redis',
  'React', 'Vue', '面试', '经验分享', '源码分析', '设计模式', '分布式',
];

const AddPostPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = async (values: { title: string; content: string }) => {
    if (tags.length === 0) {
      message.warning('请至少添加一个标签');
      return;
    }
    setLoading(true);
    try {
      const res = await addPostUsingPost({
        title: values.title,
        content: values.content,
        tags,
      });
      message.success('发布成功！');
      history.push(`/post/detail/${res.data}`);
    } catch (error: any) {
      message.error(error.message ?? '发布失败，请先登录');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    history.push('/post/list');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card title="发布新帖子" bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark
          initialValues={{ title: '', content: '' }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[
              { required: true, message: '请输入帖子标题' },
              { max: 80, message: '标题不能超过80个字符' },
            ]}
          >
            <Input
              placeholder="一个好标题能吸引更多人阅读..."
              size="large"
              maxLength={80}
              showCount
            />
          </Form.Item>

          <Form.Item label="标签" required>
            <Select
              mode="tags"
              value={tags}
              onChange={(val) => setTags(val)}
              placeholder="输入标签后按回车添加，或点击下方推荐标签"
              size="large"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
              options={SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => ({
                label: t,
                value: t,
              }))}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>推荐：</Text>
              {SUGGESTED_TAGS.slice(0, 8).map((t) => (
                <a
                  key={t}
                  style={{ fontSize: 12 }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!tags.includes(t)) {
                      setTags([...tags, t]);
                    }
                  }}
                >
                  {t}
                </a>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入帖子内容' }]}
          >
            <TextArea
              rows={12}
              placeholder="分享你的想法、技术笔记、踩坑经验..."
              showCount
              maxLength={5000}
              style={{ fontSize: 15, lineHeight: 1.8 }}
            />
          </Form.Item>

          <Form.Item>
            <Space size={16}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SendOutlined />}
              >
                发布
              </Button>
              <Button onClick={handleBack} size="large">
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddPostPage;
