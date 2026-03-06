import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { timeToMinutes } from '../utils/timeUtils';
import { showValidationErrorToast } from '../utils/toast';

export function useNodeValidation() {
  const { getNodes, getEdges } = useReactFlow();

  const validateNode = useCallback((
    currentId: string,
    currentDate: string,
    currentStart: string,
    currentEnd: string
  ) => {
    const nodes = getNodes();
    const edges = getEdges();
    const conflicts: string[] = [];

    const incomingEdges = edges.filter(edge => edge.target === currentId);
    
    incomingEdges.forEach(edge => {
      const prevNode = nodes.find(n => n.id === edge.source);
      if (prevNode && prevNode.data.date === currentDate) {
        const prevEndTime = prevNode.data.endTime as string;
        if (timeToMinutes(currentStart) < timeToMinutes(prevEndTime)) {
          conflicts.push(`Zaman hatası: Önceki iş (${prevNode.data.title || 'İsimsiz'}) ${prevEndTime}'de bitiyor.`);
        }
      }
    });

    return conflicts;
  }, [getNodes, getEdges]);

  const checkConflictForChange = useCallback((
    id: string,
    currentDate: string,
    newStartTime: string,
    newEndTime: string,
    newDate?: string
  ) => {
    const dateToCheck = newDate || currentDate;
    const potentialConflicts = validateNode(id, dateToCheck, newStartTime, newEndTime);

    if (potentialConflicts.length > 0) {
      showValidationErrorToast(potentialConflicts[0]);
      return true;
    }
    return false;
  }, [validateNode]);

  return {
    validateNode,
    checkConflictForChange
  };
}
