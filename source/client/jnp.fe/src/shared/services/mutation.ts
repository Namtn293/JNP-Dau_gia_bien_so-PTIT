import { useMutation } from 'react-query';
import {
  singleUploadFile,
  multiUploadFile,
  exportDuThaoTemplate
} from './api';

/**
 * @mutation
 * @description Single Upload File
 */
export const useSingleUploadFile = () => {
  return useMutation(singleUploadFile, {
    onSuccess: () => { },
  });
};

/**
 * @mutation
 * @description Multi Upload File
 */
export const useMultiUploadFile = () => {
  return useMutation(multiUploadFile, {
    onSuccess: () => { },
  });
};

export const useExportTemplate = () => {
  return useMutation(exportDuThaoTemplate)
};