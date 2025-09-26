from typing import List, Dict, Tuple, Any, Optional
from dataclasses import dataclass
from app.core.setup import setup_logger

logger = setup_logger(__name__)


@dataclass
class ChunkInfo:
    """Information about a file chunk"""
    files: List[Dict[str, Any]]
    total_tokens: int
    chunk_index: int
    chunk_type: str  # 'summary' or 'review'


@dataclass 
class IgnoredFile:
    """Information about an ignored file"""
    file_name: str
    reason: str
    token_count: Optional[int] = None


class ChunkingService:
    """Service for creating file chunks for LLM processing"""
    
    def __init__(self, max_chunk_tokens: int = 150000, max_file_tokens: int = 100000):
        self.max_chunk_tokens = max_chunk_tokens
        self.max_file_tokens = max_file_tokens
        logger.info(f"ChunkingService initialized with max_chunk_tokens={max_chunk_tokens}, max_file_tokens={max_file_tokens}")
    
    def sort_files_by_path(self, files: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sort files by their path/filename alphabetically to group files from the same folder.
        
        Args:
            files: List of file dictionaries with 'prFileName' key
        
        Returns:
            Sorted list of files
        """
        try:
            return sorted(files, key=lambda x: x.get("prFileName", ""))
        except Exception as e:
            logger.error(f"Error sorting files: {str(e)}")
            return files  # Return unsorted if sorting fails
    
    def estimate_file_tokens(self, file_info: Dict[str, Any]) -> int:
        """
        Estimate total tokens for a file including diff and content.
        
        Args:
            file_info: File information dictionary
            
        Returns:
            Estimated token count
        """
        try:
            file_diff = file_info.get("prFileDiff", "")
            pr_file_content_before = file_info.get("prFileContentBefore", "")
            
            # Simple character-based token estimation (1 token ≈ 4 characters)
            diff_tokens = len(file_diff) // 4
            content_tokens = len(pr_file_content_before) // 4
            
            return diff_tokens + content_tokens
        except Exception as e:
            logger.error(f"Error estimating tokens for file {file_info.get('prFileName', 'unknown')}: {str(e)}")
            return 0
    
    def is_file_oversized(self, file_info: Dict[str, Any]) -> Tuple[bool, Optional[IgnoredFile]]:
        """
        Check if a file exceeds the maximum file token limit.
        
        Args:
            file_info: File information dictionary
            
        Returns:
            Tuple of (is_oversized, ignored_file_info)
        """
        file_name = file_info.get("prFileName", "unknown")
        
        try:
            file_diff = file_info.get("prFileDiff", "")
            pr_file_content_before = file_info.get("prFileContentBefore", "")
            
            # Check if file is too large using simple character-based estimation
            diff_tokens = len(file_diff) // 4
            content_tokens = len(pr_file_content_before) // 4
            
            if diff_tokens > self.max_file_tokens or content_tokens > self.max_file_tokens:
                token_count = self.estimate_file_tokens(file_info)
                ignored_file = IgnoredFile(
                    file_name=file_name,
                    reason=f"File exceeds {self.max_file_tokens} token limit",
                    token_count=token_count
                )
                logger.warning(f"File {file_name} exceeds {self.max_file_tokens} tokens ({token_count}), marking as oversized")
                return True, ignored_file
            
            return False, None
            
        except Exception as e:
            logger.error(f"Error checking file size for {file_name}: {str(e)}")
            # Err on the side of caution - treat as oversized
            ignored_file = IgnoredFile(
                file_name=file_name,
                reason=f"Error checking file size: {str(e)}"
            )
            return True, ignored_file
    
    def create_chunks(self, files: List[Dict[str, Any]], chunk_type: str = "review") -> Tuple[List[ChunkInfo], List[IgnoredFile]]:
        """
        Create chunks of files based on token limits.
        
        Args:
            files: List of file dictionaries
            chunk_type: Type of chunking ('summary' or 'review')
        
        Returns:
            Tuple of (chunks, ignored_files)
        """
        if not files:
            logger.warning("No files provided for chunking")
            return [], []
        
        logger.info(f"Starting {chunk_type} chunking for {len(files)} files")
        
        # Sort files by path for better context grouping
        sorted_files = self.sort_files_by_path(files)
        
        chunks = []
        current_chunk_files = []
        current_chunk_tokens = 0
        ignored_files = []
        
        for file_info in sorted_files:
            file_name = file_info.get("prFileName", "unknown")
            
            # Check if file is oversized
            is_oversized, ignored_file = self.is_file_oversized(file_info)
            if is_oversized:
                ignored_files.append(ignored_file)
                continue
            
            file_tokens = self.estimate_file_tokens(file_info)
            logger.debug(f"Processing file {file_name} with {file_tokens} tokens")
            
            # Check if adding this file would exceed chunk limit
            if current_chunk_tokens + file_tokens > self.max_chunk_tokens:
                # Current chunk is full, save it and start a new one
                if current_chunk_files:
                    chunk = ChunkInfo(
                        files=current_chunk_files,
                        total_tokens=current_chunk_tokens,
                        chunk_index=len(chunks),
                        chunk_type=chunk_type
                    )
                    chunks.append(chunk)
                    logger.info(f"Created {chunk_type} chunk {len(chunks)} with {len(current_chunk_files)} files, {current_chunk_tokens} tokens")
                
                # Start new chunk
                current_chunk_files = [file_info]
                current_chunk_tokens = file_tokens
                logger.debug(f"Started new {chunk_type} chunk with file {file_name}")
            else:
                # Add file to current chunk
                current_chunk_files.append(file_info)
                current_chunk_tokens += file_tokens
                logger.debug(f"Added file {file_name} to current {chunk_type} chunk, total tokens: {current_chunk_tokens}")
        
        # Add the last chunk if it has files
        if current_chunk_files:
            chunk = ChunkInfo(
                files=current_chunk_files,
                total_tokens=current_chunk_tokens,
                chunk_index=len(chunks),
                chunk_type=chunk_type
            )
            chunks.append(chunk)
            logger.info(f"Created final {chunk_type} chunk {len(chunks)} with {len(current_chunk_files)} files, {current_chunk_tokens} tokens")
        
        # Log summary
        total_files_processed = sum(len(chunk.files) for chunk in chunks)
        total_files_ignored = len(ignored_files)
        
        logger.info(f"{chunk_type.title()} chunking complete: {len(chunks)} chunks created")
        logger.info(f"Files processed: {total_files_processed}, Files ignored: {total_files_ignored}")
        
        if ignored_files:
            ignored_names = [f.file_name for f in ignored_files]
            logger.warning(f"Ignored files: {ignored_names}")
        
        return chunks, ignored_files
    
    def convert_to_legacy_format(self, chunks: List[ChunkInfo]) -> List[Dict[str, Any]]:
        """
        Convert ChunkInfo objects to legacy dictionary format for backward compatibility.
        
        Args:
            chunks: List of ChunkInfo objects
            
        Returns:
            List of dictionaries in legacy format
        """
        return [
            {
                "files": chunk.files,
                "total_tokens": chunk.total_tokens,
                "chunk_index": chunk.chunk_index
            }
            for chunk in chunks
        ]
    
    def convert_ignored_to_legacy_format(self, ignored_files: List[IgnoredFile]) -> List[Dict[str, Any]]:
        """
        Convert IgnoredFile objects to legacy dictionary format for backward compatibility.
        
        Args:
            ignored_files: List of IgnoredFile objects
            
        Returns:
            List of dictionaries in legacy format
        """
        return [
            {
                "fileName": ignored.file_name,
                "reason": ignored.reason
            }
            for ignored in ignored_files
        ]


# Global service instance
_chunking_service = ChunkingService()


# Legacy functions for backward compatibility
def sort_files_by_path(files: List[Dict]) -> List[Dict]:
    """Legacy function - use ChunkingService.sort_files_by_path() for new code"""
    return _chunking_service.sort_files_by_path(files)


def create_chunks_for_review(files: List[Dict], max_chunk_tokens: int = 150000, max_file_tokens: int = 100000) -> Tuple[List[Dict], List[Dict]]:
    """
    Legacy function - Create chunks for review generation.
    Use ChunkingService.create_chunks() for new code.
    
    Args:
        files: List of file dictionaries
        max_chunk_tokens: Maximum tokens per chunk
        max_file_tokens: Maximum tokens per file
    
    Returns:
        Tuple of (chunks, ignored_files) in legacy format
    """
    service = ChunkingService(max_chunk_tokens, max_file_tokens)
    chunks, ignored_files = service.create_chunks(files, "review")
    
    return service.convert_to_legacy_format(chunks), service.convert_ignored_to_legacy_format(ignored_files)


def create_chunks_for_summary(files: List[Dict], max_chunk_tokens: int = 150000, max_file_tokens: int = 100000) -> Tuple[List[Dict], List[Dict]]:
    """
    Legacy function - Create chunks for summary generation.
    Use ChunkingService.create_chunks() for new code.
    
    Args:
        files: List of file dictionaries
        max_chunk_tokens: Maximum tokens per chunk
        max_file_tokens: Maximum tokens per file
    
    Returns:
        Tuple of (chunks, ignored_files) in legacy format
    """
    service = ChunkingService(max_chunk_tokens, max_file_tokens)
    chunks, ignored_files = service.create_chunks(files, "summary")
    
    return service.convert_to_legacy_format(chunks), service.convert_ignored_to_legacy_format(ignored_files)


def create_summary_chunks(files: List[Dict], max_chunk_tokens: int = 200000, max_file_tokens: int = 100000) -> Tuple[List[Dict], List[Dict]]:
    """
    Legacy function - wrapper for create_chunks_for_summary.
    Use ChunkingService.create_chunks() for new code.
    """
    return create_chunks_for_summary(files, max_chunk_tokens, max_file_tokens)


def create_review_chunks(files: List[Dict], max_chunk_tokens: int = 150000, max_file_tokens: int = 100000) -> Tuple[List[Dict], List[Dict]]:
    """
    Legacy function - wrapper for create_chunks_for_review.
    Use ChunkingService.create_chunks() for new code.
    """
    return create_chunks_for_review(files, max_chunk_tokens, max_file_tokens)


class ChunkPreparationService:
    """Service for preparing chunks with metadata for LLM processing"""
    
    @staticmethod
    def prepare_chunk_for_summary(chunk: Dict[str, Any], pr_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepare a chunk for summary generation by creating the necessary variables.
        
        Args:
            chunk: Chunk containing files and metadata
            pr_metadata: PR metadata (title, body, etc.)
        
        Returns:
            Variables ready for summary generation
        """
        try:
            changed_files = []
            pr_diff = ""
            
            for file_info in chunk["files"]:
                file_name = file_info.get("prFileName", "unknown")
                changed_files.append(file_name)
                file_diff = file_info.get("prFileDiff", "")
                pr_diff += f"\n\n--- File: {file_name} ---\n{file_diff}"
            
            # Create severity list based on minSeverity
            severity_list = ["Info", "Minor", "Major", "Critical", "Blocker"]
            min_severity = pr_metadata.get("minSeverity", "Major")
            try:
                min_severity_index = severity_list.index(min_severity)
                filtered_severity_list = severity_list[min_severity_index:]
            except ValueError:
                logger.warning(f"Invalid minSeverity '{min_severity}', defaulting to Major")
                filtered_severity_list = ["Major", "Critical", "Blocker"]
            
            return {
                "prTitle": pr_metadata.get("prTitle", ""),
                "prBody": pr_metadata.get("prBody", ""),
                "author_name": pr_metadata.get("author_name", ""),
                "prNumber": pr_metadata.get("prNumber", ""),
                "api_key": pr_metadata.get("api_key"),
                "model_name": pr_metadata.get("model_name", "claude-opus-4-1-20250805"),
                "changed_files": ", ".join(changed_files),
                "repo_structure_summary": pr_metadata.get("repo_structure_summary", ""),
                "pr_diff": pr_diff,
                "severity_list": str(filtered_severity_list),
                "chunk_info": {
                    "index": chunk.get('chunk_index', 0) + 1,
                    "description": f"Chunk {chunk.get('chunk_index', 0) + 1} of multiple chunks"
                }
            }
            
        except Exception as e:
            logger.error(f"Error preparing chunk for summary: {str(e)}")
            raise
    
    @staticmethod
    def prepare_chunk_for_review(chunk: Dict[str, Any], pr_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepare a chunk for review generation by creating the necessary variables.
        
        Args:
            chunk: Chunk containing files and metadata
            pr_metadata: PR metadata (title, body, etc.)
        
        Returns:
            Variables ready for review generation
        """
        try:
            changed_files = []
            pr_diff_chunk = ""
            pr_file_content_before = ""
            
            for file_info in chunk["files"]:
                file_name = file_info.get("prFileName", "unknown")
                changed_files.append(file_name)
                
                # Format diff for LLM
                try:
                    from .diff_formatter import format_diff_for_llm, format_diff_for_llm_raw_diff
                    pr_diff_hunks = file_info.get("prFileDiffHunks", [])
                    if pr_diff_hunks==[]:
                        logger.info(f"No diff hunks found for {file_name}, using raw diff")
                        pr_diff_processed = format_diff_for_llm_raw_diff(file_info.get('prFileDiff', ''), file_name)
                        pr_diff_chunk += f"\n\n--- File: {file_name} ---\n{pr_diff_processed}"
                    else:
                        pr_diff_processed = format_diff_for_llm(pr_diff_hunks, file_name)
                        pr_diff_chunk += f"\n\n--- File: {file_name} ---\n{pr_diff_processed}"
                except Exception as e:
                    logger.warning(f"Error formatting diff for {file_name}: {str(e)}, using raw diff")
                    pr_diff_chunk += f"\n\n--- File: {file_name} ---\n{file_info.get('prFileDiff', '')}"
                
                # Collect file content before changes if available
                if file_info.get("prFileContentBefore"):
                    pr_file_content_before += f"\n\n--- File: {file_name} (Before Changes) ---\n{file_info['prFileContentBefore']}"

            # Create severity list based on minSeverity
            severity_list = ["Info", "Minor", "Major", "Critical", "Blocker"]
            min_severity = pr_metadata.get("minSeverity", "Major")
            try:
                min_severity_index = severity_list.index(min_severity)
                filtered_severity_list = severity_list[min_severity_index:]
            except ValueError:
                logger.warning(f"Invalid minSeverity '{min_severity}', defaulting to Major")
                filtered_severity_list = ["Major", "Critical", "Blocker"]
            
            return {
                "prTitle": pr_metadata.get("prTitle", ""),
                "prBody": pr_metadata.get("prBody", ""),
                "author_name": pr_metadata.get("author_name", ""),
                "prNumber": pr_metadata.get("prNumber", ""),
                "changed_files": ", ".join(changed_files),
                "repo_structure_summary": pr_metadata.get("repo_structure_summary", ""),
                "prFileContentBefore": pr_file_content_before,
                "pr_diff": pr_diff_chunk,
                "severity_list": str(filtered_severity_list),
                "chunk_info": {
                    "index": chunk.get('chunk_index', 0) + 1,
                    "description": f"Chunk {chunk.get('chunk_index', 0) + 1} of multiple chunks"
                }
            }
            
        except Exception as e:
            logger.error(f"Error preparing chunk for review: {str(e)}")
            raise


# Global service instances
_chunk_preparation_service = ChunkPreparationService()


# Legacy functions for backward compatibility
def prepare_chunk_for_summary(chunk: Dict, pr_metadata: Dict) -> Dict:
    """Legacy function - use ChunkPreparationService.prepare_chunk_for_summary() for new code"""
    return _chunk_preparation_service.prepare_chunk_for_summary(chunk, pr_metadata)


def prepare_chunk_for_review(chunk: Dict, pr_metadata: Dict) -> Dict:
    """Legacy function - use ChunkPreparationService.prepare_chunk_for_review() for new code"""
    return _chunk_preparation_service.prepare_chunk_for_review(chunk, pr_metadata)


def convert_hunks_to_unified_diff(hunks: List[str], file_name: str) -> str:
    """
    Convert hunks to unified diff format.
    Simple implementation for backward compatibility.
    
    Args:
        hunks: List of diff hunks
        file_name: Name of the file
        
    Returns:
        Combined diff string
    """
    if not hunks:
        return ""
    
    try:
        return "\n".join(hunks)
    except Exception as e:
        logger.error(f"Error converting hunks to unified diff for {file_name}: {str(e)}")
        return ""
