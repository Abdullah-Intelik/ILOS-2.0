import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, message, Spin, Modal, Descriptions } from 'antd';
import { MobileOutlined, EyeOutlined, CheckOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';

const MobileSubmissions = () => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch mobile submissions from backend
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/applications/mobile-submissions');
      if (response.data.success) {
        setSubmissions(response.data.applications);
        message.success(`Loaded ${response.data.count} mobile submissions`);
      }
    } catch (error) {
      console.error('Error fetching mobile submissions:', error);
      message.error('Failed to load mobile submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSubmissions, 30000);
    return () => clearInterval(interval);
  }, []);

  // View submission details
  const handleViewDetails = async (losId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/applications/${losId}`);
      if (response.data.success) {
        setSelectedSubmission(response.data.data || response.data.application);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      message.error('Failed to load submission details');
    }
  };

  // Complete application - navigate to form
  const handleCompleteApplication = (record) => {
    // Navigate to PB application form with pre-filled data
    const url = `/pb/${record.productType.toLowerCase().replace(' ', '-')}?losId=${record.losId}&fromMobile=true`;
    window.open(url, '_blank');
  };

  const columns = [
    {
      title: 'LOS ID',
      dataIndex: 'losId',
      key: 'losId',
      render: (losId) => (
        <Tag color="blue" icon={<MobileOutlined />}>
          LOS-{losId}
        </Tag>
      ),
      sorter: (a, b) => a.losId - b.losId,
    },
    {
      title: 'Product Type',
      dataIndex: 'productType',
      key: 'productType',
      filters: [
        { text: 'CASHPLUS', value: 'CASHPLUS' },
        { text: 'AUTOLOAN', value: 'AUTOLOAN' },
        { text: 'SMEASAAN', value: 'SMEASAAN' },
        { text: 'AMEENDRIVE', value: 'AMEENDRIVE' },
        { text: 'COMMERCIAL VEHICLE', value: 'COMMERCIAL VEHICLE' },
        { text: 'PLATINUM CARD', value: 'PLATINUM CARD' },
        { text: 'CREDITCARD', value: 'CREDITCARD' },
      ],
      onFilter: (value, record) => record.productType === value,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'CNIC',
      dataIndex: 'cnic',
      key: 'cnic',
    },
    {
      title: 'Amount (PKR)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount ? `Rs. ${amount.toLocaleString()}` : 'N/A',
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
    },
    {
      title: 'Documents',
      dataIndex: 'hasDocuments',
      key: 'hasDocuments',
      render: (hasDocuments) => (
        <Tag color={hasDocuments ? 'green' : 'red'}>
          {hasDocuments ? 'Available' : 'Missing'}
        </Tag>
      ),
      filters: [
        { text: 'With Documents', value: true },
        { text: 'No Documents', value: false },
      ],
      onFilter: (value, record) => record.hasDocuments === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.losId)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleCompleteApplication(record)}
          >
            Complete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <span>
            <MobileOutlined style={{ marginRight: '8px' }} />
            📱 Mobile App Submissions
          </span>
        }
        extra={
          <Button type="primary" onClick={fetchSubmissions} loading={loading}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={submissions}
          rowKey="losId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} submissions`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Mobile Submission Details - LOS-${selectedSubmission?.losId}`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="complete"
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleCompleteApplication({
                losId: selectedSubmission?.losId,
                productType: selectedSubmission?.loanType?.replace('_applications', '').toUpperCase(),
              });
            }}
          >
            Complete Application
          </Button>,
        ]}
        width={800}
      >
        {selectedSubmission && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="LOS ID" span={1}>
              LOS-{selectedSubmission.losId}
            </Descriptions.Item>
            <Descriptions.Item label="Product Type" span={1}>
              {selectedSubmission.loanType}
            </Descriptions.Item>
            <Descriptions.Item label="CNIC" span={1}>
              {selectedSubmission.cnic}
            </Descriptions.Item>
            <Descriptions.Item label="Submitted At" span={1}>
              {new Date(selectedSubmission.submittedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Has CNIC Document" span={1}>
              <Tag color={selectedSubmission.documents?.cnic ? 'green' : 'red'}>
                {selectedSubmission.documents?.cnic ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Has Salary Slip" span={1}>
              <Tag color={selectedSubmission.documents?.salarySlip ? 'green' : 'red'}>
                {selectedSubmission.documents?.salarySlip ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mobile Data" span={2}>
              <pre style={{ maxHeight: '400px', overflow: 'auto', background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                {JSON.stringify(selectedSubmission.mobileData, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MobileSubmissions;

