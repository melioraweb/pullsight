// /**
//  * Toast Utility Usage Guide
//  *
//  * This file demonstrates how to use the toast utility with various scenarios
//  * that are common in the PullSight application.
//  */

// import { showToast } from "@/lib/toast";

// // Example 1: Basic success/error notifications
// export const handleApiResponse = async (apiCall: () => Promise<any>) => {
//     try {
//         const response = await apiCall();
//         showToast.success("Operation completed successfully");
//         return response;
//     } catch (error) {
//         showToast.error("Operation failed", {
//             description:
//                 error instanceof Error
//                     ? error.message
//                     : "An unexpected error occurred",
//         });
//         throw error;
//     }
// };

// // Example 2: Using toast with TanStack Query mutations
// export const useMutationWithToast = () => {
//     const mutation = useMutation({
//         mutationFn: async (data) => {
//             // Your API call here
//             const response = await fetch("/api/example", {
//                 method: "POST",
//                 body: JSON.stringify(data),
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to save data");
//             }

//             return response.json();
//         },
//         onSuccess: (data) => {
//             showToast.success("Data saved successfully!", {
//                 description: "Your changes have been applied.",
//             });
//         },
//         onError: (error: Error) => {
//             showToast.error("Failed to save data", {
//                 description: error.message,
//             });
//         },
//     });

//     return mutation;
// };

// // Example 3: Using promise toast for automatic loading states
// export const handlePromiseOperation = async (promise: Promise<any>) => {
//     return showToast.promise(promise, {
//         loading: "Processing your request...",
//         success: "Operation completed successfully!",
//         error: (error) => `Operation failed: ${error.message}`,
//     });
// };

// // Example 4: Form submission with validation feedback
// export const handleFormSubmission = async (
//     formData: any,
//     validateFn: () => boolean
// ) => {
//     // Client-side validation
//     if (!validateFn()) {
//         showToast.warning("Please fill in all required fields", {
//             description: "Check the form for any missing information.",
//         });
//         return;
//     }

//     // Show loading state
//     const toastId = showToast.loading("Saving your changes...");

//     try {
//         const response = await fetch("/api/submit", {
//             method: "POST",
//             body: JSON.stringify(formData),
//         });

//         if (!response.ok) {
//             throw new Error("Submission failed");
//         }

//         // Dismiss loading and show success
//         showToast.dismiss(toastId);
//         showToast.success("Form submitted successfully!", {
//             description: "Your information has been saved.",
//         });
//     } catch (error) {
//         // Dismiss loading and show error
//         showToast.dismiss(toastId);
//         showToast.error("Submission failed", {
//             description:
//                 error instanceof Error
//                     ? error.message
//                     : "Please try again later",
//         });
//     }
// };

// // Example 5: Bulk operations with detailed feedback
// export const handleBulkOperation = async (
//     items: any[],
//     operation: (item: any) => Promise<any>
// ) => {
//     const toastId = showToast.loading(`Processing ${items.length} items...`);

//     try {
//         const results = await Promise.allSettled(
//             items.map((item) => operation(item))
//         );

//         const successful = results.filter(
//             (r) => r.status === "fulfilled"
//         ).length;
//         const failed = results.filter((r) => r.status === "rejected").length;

//         showToast.dismiss(toastId);

//         if (failed === 0) {
//             showToast.success(
//                 `All ${successful} items processed successfully!`
//             );
//         } else if (successful === 0) {
//             showToast.error(`Failed to process all ${failed} items`);
//         } else {
//             showToast.warning(
//                 `Processed ${successful} items, ${failed} failed`,
//                 {
//                     description:
//                         "Some items could not be processed. Please check and retry.",
//                 }
//             );
//         }
//     } catch (error) {
//         showToast.dismiss(toastId);
//         showToast.error("Bulk operation failed", {
//             description: "An unexpected error occurred during processing",
//         });
//     }
// };

// // Example 6: Conditional notifications based on user preferences
// export const conditionalToast = (
//     message: string,
//     userSettings: { notificationsEnabled: boolean }
// ) => {
//     if (userSettings.notificationsEnabled) {
//         showToast.info(message);
//     }
// };

// // Example 7: Action confirmations with interactive buttons
// export const handleDeleteWithConfirmation = async (
//     itemId: string,
//     onDelete: (id: string) => Promise<void>
// ) => {
//     showToast.warning("Are you sure you want to delete this item?", {
//         description: "This action cannot be undone.",
//         duration: 10000, // Give user time to decide
//         action: {
//             label: "Delete",
//             onClick: async () => {
//                 try {
//                     await onDelete(itemId);
//                     showToast.success("Item deleted successfully");
//                 } catch (error) {
//                     showToast.error("Failed to delete item");
//                 }
//             },
//         },
//     });
// };
