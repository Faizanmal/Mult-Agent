"""
Advanced AI Features: RAG, Vector Database, Semantic Search
"""
import os
import logging
from typing import List, Dict, Optional, Any
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from django.conf import settings

logger = logging.getLogger(__name__)


class VectorDatabase:
    """
    Vector database for semantic search and RAG
    Uses ChromaDB for vector storage and retrieval
    """
    
    def __init__(self, collection_name: str = "documents"):
        self.collection_name = collection_name
        self.client = None
        self.collection = None
        self.embedding_model = None
        self._initialize()
    
    def _initialize(self):
        """Initialize ChromaDB and embedding model"""
        try:
            # Initialize ChromaDB client
            persist_directory = os.path.join(settings.BASE_DIR, 'vector_db')
            os.makedirs(persist_directory, exist_ok=True)
            
            self.client = chromadb.Client(Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=persist_directory
            ))
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            logger.info(f"Vector database initialized: {self.collection_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize vector database: {str(e)}")
            raise
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """
        Add documents to vector database
        
        Args:
            documents: List of dicts with 'id', 'text', and optional 'metadata'
        """
        try:
            ids = []
            texts = []
            metadatas = []
            
            for doc in documents:
                ids.append(str(doc['id']))
                texts.append(doc['text'])
                metadatas.append(doc.get('metadata', {}))
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(texts).tolist()
            
            # Add to collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas
            )
            
            logger.info(f"Added {len(documents)} documents to vector database")
            
        except Exception as e:
            logger.error(f"Failed to add documents: {str(e)}")
            raise
    
    def search(self, query: str, top_k: int = 5, filter_metadata: Optional[Dict] = None) -> List[Dict]:
        """
        Semantic search in vector database
        
        Args:
            query: Search query
            top_k: Number of results to return
            filter_metadata: Optional metadata filter
        
        Returns:
            List of matching documents with scores
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            # Search in collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=filter_metadata
            )
            
            # Format results
            documents = []
            if results['documents'] and len(results['documents']) > 0:
                for i in range(len(results['ids'][0])):
                    documents.append({
                        'id': results['ids'][0][i],
                        'text': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else 0,
                    })
            
            return documents
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []
    
    def update_document(self, doc_id: str, text: str, metadata: Optional[Dict] = None):
        """Update existing document"""
        try:
            embedding = self.embedding_model.encode([text])[0].tolist()
            
            self.collection.update(
                ids=[str(doc_id)],
                embeddings=[embedding],
                documents=[text],
                metadatas=[metadata] if metadata else None
            )
            
            logger.info(f"Updated document: {doc_id}")
            
        except Exception as e:
            logger.error(f"Failed to update document: {str(e)}")
            raise
    
    def delete_document(self, doc_id: str):
        """Delete document from database"""
        try:
            self.collection.delete(ids=[str(doc_id)])
            logger.info(f"Deleted document: {doc_id}")
        except Exception as e:
            logger.error(f"Failed to delete document: {str(e)}")
            raise
    
    def get_collection_stats(self) -> Dict:
        """Get collection statistics"""
        try:
            count = self.collection.count()
            return {
                'collection_name': self.collection_name,
                'document_count': count,
                'embedding_dimension': 384,  # all-MiniLM-L6-v2 dimension
            }
        except Exception as e:
            logger.error(f"Failed to get stats: {str(e)}")
            return {}


class RAGSystem:
    """
    Retrieval-Augmented Generation system
    Combines vector search with LLM generation
    """
    
    def __init__(self, vector_db: VectorDatabase):
        self.vector_db = vector_db
    
    def retrieve_context(self, query: str, top_k: int = 3) -> str:
        """
        Retrieve relevant context for query
        
        Args:
            query: User query
            top_k: Number of documents to retrieve
        
        Returns:
            Combined context string
        """
        documents = self.vector_db.search(query, top_k=top_k)
        
        if not documents:
            return ""
        
        # Combine document texts
        context_parts = []
        for i, doc in enumerate(documents, 1):
            context_parts.append(f"[Document {i}]\n{doc['text']}\n")
        
        return "\n".join(context_parts)
    
    def generate_with_context(self, query: str, groq_service, top_k: int = 3) -> Dict:
        """
        Generate response using retrieved context
        
        Args:
            query: User query
            groq_service: Groq service instance for generation
            top_k: Number of documents to retrieve
        
        Returns:
            Response with context and generation
        """
        # Retrieve relevant context
        context = self.retrieve_context(query, top_k=top_k)
        
        if not context:
            # No context found, generate without RAG
            return {
                'answer': "I don't have enough context to answer this question accurately.",
                'context_used': False,
                'sources': []
            }
        
        # Build enhanced prompt with context
        enhanced_prompt = f"""Based on the following context, answer the question accurately and concisely.

Context:
{context}

Question: {query}

Answer:"""
        
        # Generate response using Groq
        response = groq_service.generate_completion(enhanced_prompt)
        
        # Get source documents
        source_docs = self.vector_db.search(query, top_k=top_k)
        sources = [{'id': doc['id'], 'text': doc['text'][:200]} for doc in source_docs]
        
        return {
            'answer': response.get('content', ''),
            'context_used': True,
            'sources': sources,
            'context': context
        }


class SemanticSearch:
    """
    Advanced semantic search with ranking and filtering
    """
    
    def __init__(self, vector_db: VectorDatabase):
        self.vector_db = vector_db
    
    def search(self, query: str, filters: Optional[Dict] = None, 
               top_k: int = 10, min_score: float = 0.0) -> List[Dict]:
        """
        Perform semantic search with advanced filtering
        
        Args:
            query: Search query
            filters: Metadata filters
            top_k: Maximum results
            min_score: Minimum similarity score
        
        Returns:
            Ranked search results
        """
        # Perform vector search
        results = self.vector_db.search(query, top_k=top_k, filter_metadata=filters)
        
        # Filter by minimum score
        filtered_results = [
            result for result in results 
            if (1 - result['distance']) >= min_score  # Convert distance to similarity
        ]
        
        # Add relevance score
        for result in filtered_results:
            result['relevance_score'] = round(1 - result['distance'], 4)
        
        return filtered_results
    
    def hybrid_search(self, query: str, keyword_results: List[Dict], 
                     top_k: int = 10, alpha: float = 0.5) -> List[Dict]:
        """
        Combine semantic and keyword search results
        
        Args:
            query: Search query
            keyword_results: Results from keyword search
            top_k: Maximum results
            alpha: Weight for semantic search (1-alpha for keyword)
        
        Returns:
            Hybrid ranked results
        """
        # Get semantic results
        semantic_results = self.vector_db.search(query, top_k=top_k * 2)
        
        # Create score maps
        semantic_scores = {r['id']: 1 - r['distance'] for r in semantic_results}
        keyword_scores = {r['id']: r.get('score', 0.5) for r in keyword_results}
        
        # Combine scores
        all_ids = set(semantic_scores.keys()) | set(keyword_scores.keys())
        hybrid_scores = {}
        
        for doc_id in all_ids:
            semantic_score = semantic_scores.get(doc_id, 0)
            keyword_score = keyword_scores.get(doc_id, 0)
            hybrid_scores[doc_id] = alpha * semantic_score + (1 - alpha) * keyword_score
        
        # Sort and get top results
        sorted_ids = sorted(hybrid_scores.keys(), key=lambda x: hybrid_scores[x], reverse=True)[:top_k]
        
        # Build result list
        results = []
        for doc_id in sorted_ids:
            # Get document from either result set
            doc = next((r for r in semantic_results if r['id'] == doc_id), None) or \
                  next((r for r in keyword_results if r['id'] == doc_id), None)
            
            if doc:
                doc['hybrid_score'] = round(hybrid_scores[doc_id], 4)
                results.append(doc)
        
        return results


class DocumentProcessor:
    """
    Process and chunk documents for vector database
    """
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 512, overlap: int = 128) -> List[str]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Input text
            chunk_size: Size of each chunk in characters
            overlap: Overlap between chunks
        
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > chunk_size * 0.5:  # At least 50% of chunk size
                    chunk = chunk[:break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            start = end - overlap
        
        return chunks
    
    @staticmethod
    def extract_metadata(text: str) -> Dict:
        """
        Extract metadata from document text
        
        Args:
            text: Document text
        
        Returns:
            Metadata dictionary
        """
        metadata = {
            'length': len(text),
            'word_count': len(text.split()),
            'has_code': '```' in text or 'def ' in text or 'class ' in text,
        }
        
        # Extract title if present
        lines = text.split('\n')
        if lines and lines[0].startswith('#'):
            metadata['title'] = lines[0].replace('#', '').strip()
        
        return metadata


# Global instances
vector_db = VectorDatabase()
rag_system = RAGSystem(vector_db)
semantic_search = SemanticSearch(vector_db)
