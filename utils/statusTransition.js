const VALID_TRANSITIONS = {
  'OPEN': ['IN_PROGRESS'],
  'IN_PROGRESS': ['RESOLVED'],
  'RESOLVED': ['CLOSED'],
  'CLOSED': []
};

const isValidTransition = (oldStatus, newStatus) => {
  if (!oldStatus) return true; 
  const allowedNextStatuses = VALID_TRANSITIONS[oldStatus];
  return allowedNextStatuses && allowedNextStatuses.includes(newStatus);
};

const getValidNextStatuses = (currentStatus) => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

module.exports = {
  isValidTransition,
  getValidNextStatuses,
  VALID_TRANSITIONS
};

