import { Height } from "@/shared/components/global-styled/styled";
import Text from "@/shared/components/text";
import ErrorImage from "@assets/images/error-boundary-image.png";
import { Button, Flex } from "antd";
import type { FallbackProps } from "react-error-boundary";
import { ContentWrapper, Wrapper } from "./styled";

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const err = error as Error;

  const isChunkLoadError =
    err?.name === "ChunkLoadError" ||
    err?.message?.includes("Failed to fetch dynamically imported module") ||
    err?.message?.includes("Importing a module script failed") ||
    err?.message?.includes("dynamically imported module");

  //Handle error when deploy new version
  if (isChunkLoadError) {
    const currentPath = window.location.pathname;
    const lastChunkErrorPath = window.sessionStorage.getItem("chunkErrorPath");

    if (lastChunkErrorPath !== currentPath) {
      window.sessionStorage.setItem("chunkErrorPath", currentPath);
      window.location.reload();
      return null;
    }
  }

  return (
    <Wrapper>
      <Flex gap="4.8rem">
        <img alt="" src={ErrorImage} />
        <ContentWrapper>
          <Text>
            Đã có lỗi xảy ra :(
            <br />
            Vui lòng thử lại sau.
          </Text>
          <Height />
          <Flex gap="1rem">
            <Button
              type="primary"
              onClick={() => {
                window.sessionStorage.removeItem("chunkErrorPath");
                if (resetErrorBoundary) resetErrorBoundary();
                else window.location.reload();
              }}
            >
              Tải lại trang
            </Button>
            <Button onClick={() => (window.location.href = "/")}>
              Về trang chủ
            </Button>
          </Flex>
        </ContentWrapper>
      </Flex>
    </Wrapper>
  );
};
export default ErrorFallback;
