import { FileMap, UploadVariables } from "./types";

/**
 * Builds FormData for file uploads following the GraphQL multipart spec
 */
export const buildFormData = (
  query: string,
  variables: Record<string, any>
): { formData: FormData; fileMap: FileMap; uploads: UploadVariables } => {
  const formData = new FormData();
  const fileMap: FileMap = {};
  const uploads: UploadVariables = {};

  Object.entries(variables).forEach(([key, value], index) => {
    if (value instanceof File || value instanceof Blob) {
      const fieldKey = `variables.${key}`;
      fileMap[index] = [fieldKey];
      uploads[index] = value;
    }
  });

  formData.append("operations", JSON.stringify({ query, variables }));
  formData.append("map", JSON.stringify(fileMap));

  Object.entries(uploads).forEach(([index, file]) => {
    formData.append(index, file);
  });

  return { formData, fileMap, uploads };
};