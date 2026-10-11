import { useCustomEvent } from '@shared/hooks/useCustomEvent';
import useNotification from "@/shared/hooks/useNotification";
import { useExportTemplate } from '@shared//services/mutation';
import { useAppDispatch, useAppSelector } from '@packages/redux/hooks';
import { setIsLoading } from '@packages/redux/slices';
import { selectDocumentId } from '@packages/redux/slices/FormSlice';
import { useFileManagementService } from '@shared/hooks/useFileManagementService';

export const useHandleEform = ({ toggle, dichVuCongId, handlePushFile, hoSoId, loaiVanBanId }: any) => {
  const dispatch = useAppDispatch();
  const documentId = useAppSelector(selectDocumentId);
  const { mutate: exportTemplate } = useExportTemplate();

  const { showErrorNotify, showSuccessNotify } = useNotification();
  const fileManage = useFileManagementService();

  useCustomEvent('EFORM_CANCEL', (_: any) => { toggle(); });

  useCustomEvent('EFORM_SUBMIT_RECORD', async (data: any) => {
    if (!data) return;
    try {
      dispatch(setIsLoading(true));

      exportTemplate(
        {
          thuTucId: dichVuCongId,
          payload: data,
          HoSoId: hoSoId ? Number(hoSoId) : null,
          LoaiVanBanId: loaiVanBanId ? Number(loaiVanBanId) : null
        },
        {
          onSuccess(data: any) {
            if (data?.data?.pdfPath) {
              typeof handlePushFile === "function" && handlePushFile(documentId, data?.data?.pdfPath);
              dispatch(setIsLoading(false));
              toggle();
            }
          },
          onError(error: any) {
            dispatch(setIsLoading(false));
            throw new Error(error?.message || 'Tiếp tục thất bại!');
          },
        }
      )
    } catch (err: any) {
      showErrorNotify(err?.message || 'Đã có lỗi xảy ra!');
      dispatch(setIsLoading(false));
    }
  });

  useCustomEvent('EFORM_SAVE_TO_KHAI', async (data: any) => {
    if (!data) return;
    try {
      dispatch(setIsLoading(true));

      exportTemplate(
        {
          thuTucId: dichVuCongId,
          payload: data,
          HoSoId: hoSoId ? Number(hoSoId) : null,
          LoaiVanBanId: loaiVanBanId ? Number(loaiVanBanId) : null
        },
        {
          onSuccess(data: any) {
            if (data?.data?.wordPath) {
              fileManage.download(
                data?.data?.wordPath,
                () => {
                  dispatch(setIsLoading(false));
                  showSuccessNotify('Xuất dự thảo thành công!')
                }
              );
            }
          },
          onError(error: any) {
            dispatch(setIsLoading(false));
            throw new Error(error?.message || 'Xuất dự thảo thất bại!');
          },
        }
      )
    } catch (err: any) {
      showErrorNotify(err?.message || 'Xuất dự thảo thất bại!');
      dispatch(setIsLoading(false));
    }
  });
}

export default useHandleEform;