import React, { useState, useEffect } from 'react';
import adminAxios from '../../utils/adminAxios';
import './panels.css';

const DepositRequestPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await adminAxios.get('admin/deposit-requests/');
      const pendingDeposits = res.data.filter(deposit => deposit.status === 'pending');
      setDeposits(pendingDeposits);
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (deposit, action) => {
    setSelectedDeposit(deposit);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    try {
      await adminAxios.post('admin/deposit-action/', { 
        deposit_id: selectedDeposit.id, 
        action: actionType 
      });
      setShowConfirmModal(false);
      fetchDeposits();
      alert(`Deposit request ${actionType}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${actionType} deposit:`, error);
      alert(`Error: ${error.response?.data?.error || 'Something went wrong'}`);
    }
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedDeposit(null);
    setActionType('');
  };

  const filteredDeposits = deposits.filter((deposit) =>
    [
      deposit.user_info?.username,
      deposit.user_info?.mobile,
      deposit.amount,
      deposit.created_at,
      deposit.utr_number,
      deposit.status,
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Highlight stats
  const totalAmount = deposits.reduce((sum, dep) => sum + parseFloat(dep.amount), 0);

  return (
    <div className="panel">
      <h2>Deposit Requests</h2>

      <div className="stats-row highlight-stats">
        <div className="stat-card stat-pending">
          <span className="stat-number">{deposits.length}</span>
          <span className="stat-label">Pending Requests</span>
        </div>
        <div className="stat-card stat-amount">
          <span className="stat-number">
            ₹{totalAmount.toLocaleString(undefined, {minimumFractionDigits:2})}
          </span>
          <span className="stat-label">Total Amount</span>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by username, mobile, UTR, or amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading-message">Loading deposit requests...</div>
      ) : (
        <div className="panel-content" style={{maxHeight: "60vh", overflow: "auto", borderRadius: "8px", boxShadow: "0 2px 8px #e0e0e0"}}>
          <table className="admin-table enhanced-table">
            <thead style={{position: "sticky", top: 0, background: "#f8fafc", zIndex: 1}}>
              <tr>
                <th>ID</th>
                <th>User Details</th>
                <th>Amount</th>
                <th>UTR Number</th>
                <th>Date & Time</th>
                
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length > 0 ? (
                filteredDeposits.map((deposit) => (
                  <tr key={deposit.id}>
                    <td>{deposit.id}</td>
                    <td className="user-details">
                      <div className="user-info">
                        <strong>{deposit.user_info?.username}</strong>
                        <span className="mobile">{deposit.user_info?.mobile}</span>
                      </div>
                    </td>
                    <td className="amount-cell">₹{deposit.amount}</td>
                    <td className="utr-cell">{deposit.utr_number}</td>
                    <td className="date-cell">
                      <div className="datetime">
                        <span className="date">{new Date(deposit.created_at).toLocaleDateString()}</span>
                        <span className="time">{new Date(deposit.created_at).toLocaleTimeString()}</span>
                      </div>
                    </td>
                   
                    <td>
                      {deposit.status === 'pending' ? (
                        <div className="action-buttons">
                          <button
                            className="action-btn approve"
                            onClick={() => handleActionClick(deposit, 'approve')}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleActionClick(deposit, 'reject')}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      ) : (
                        <span className="processed">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No pending deposit requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedDeposit && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="deposit-details">
                <h4>Deposit Request Details:</h4>
                <div className="detail-row">
                  <span>Username:</span>
                  <strong>{selectedDeposit.user_info?.username}</strong>
                </div>
                <div className="detail-row">
                  <span>Mobile:</span>
                  <strong>{selectedDeposit.user_info?.mobile}</strong>
                </div>
                <div className="detail-row">
                  <span>Amount:</span>
                  <strong>₹{selectedDeposit.amount}</strong>
                </div>
                <div className="detail-row">
                  <span>UTR Number:</span>
                  <strong>{selectedDeposit.utr_number}</strong>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <strong>{new Date(selectedDeposit.created_at).toLocaleString()}</strong>
                </div>
              </div>
              <div className="confirmation-message">
                Are you sure you want to <strong>{actionType}</strong> this deposit request?
                {actionType === 'approve' && (
                  <div className="approval-note">
                    ₹{selectedDeposit.amount} will be added to the user's wallet.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className={`confirm-btn ${actionType}`}
                onClick={confirmAction}
              >
                {actionType === 'approve' ? '✓ Approve' : '✗ Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositRequestPanel;