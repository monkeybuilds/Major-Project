from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(pages: list[str]) -> list[dict]:
    """
    Split page texts into smaller overlapping chunks.
    Returns a list of dicts with 'text', 'page_number', and 'chunk_index'.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = []
    chunk_index = 0

    for page_num, page_text in enumerate(pages, start=1):
        page_chunks = splitter.split_text(page_text)
        for text in page_chunks:
            chunks.append({
                "text": text,
                "page_number": page_num,
                "chunk_index": chunk_index,
            })
            chunk_index += 1

    return chunks
