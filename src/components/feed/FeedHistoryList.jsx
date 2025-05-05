import React, { useState, useEffect } from 'react';
import { Table, Card, message } from 'antd';
import { feedHistoryService } from '../../services/feedHistoryService';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FeedHistoryList = () => {
  const [feedHistories, setFeedHistories] = useState([]);
  const [loading, setLoading] = useState(false);
    const { penId } = useParams();
    const navigate = useNavigate();

  useEffect(() => {
    fetchFeedHistories();
    }, [penId]);

  const fetchFeedHistories = async () => {
        try {
    setLoading(true);
            let data;
            if (penId) {
                data = await feedHistoryService.getFeedHistoriesByPenId(penId);
      } else {
        data = await feedHistoryService.getAllFeedHistories();
      }
            setFeedHistories(data);
        } catch (error) {
            message.error('Không thể tải danh sách lịch sử cho ăn');
    } finally {
      setLoading(false);
    }
  };

    const columns = [
        {
            title: 'Chuồng nuôi',
            dataIndex: 'pigPenName',
            key: 'pigPenName',
        },
        {
            title: 'Loại thức ăn',
            dataIndex: 'feedType',
            key: 'feedType',
        },
        {
            title: 'Khẩu phần (kg)',
            dataIndex: 'dailyFood',
            key: 'dailyFood',
        },
        {
            title: 'Thời gian cho ăn',
            dataIndex: 'feedingTime',
            key: 'feedingTime',
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Người cho ăn',
            dataIndex: 'createdByName',
            key: 'createdByName',
        }
    ];

  return (
        <div style={{ padding: '20px' }}>
            {penId && (
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: '20px' }}
                >
                    Quay lại
                </Button>
            )}
            <Card 
                title={penId ? "Lịch sử cho ăn của chuồng" : "Lịch sử cho ăn"} 
                className="feed-history-list"
            >
                <Table
                    dataSource={feedHistories}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng số ${total} bản ghi`
                    }}
                />
            </Card>
        </div>
  );
};

export default FeedHistoryList;