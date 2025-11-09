'use client'

import React, { useState, useRef, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Upload,
  FileText,
  Image,
  Mic,
  Video,
  File,
  X,
  Download,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Search,
  Copy,
  Share,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useDropzone } from 'react-dropzone'

interface ProcessingOptions {
  analyze_sentiment?: boolean
  summarize?: boolean
  extract_keywords?: boolean
  detect_language?: boolean
  generate_caption?: boolean
  detect_objects?: boolean
  extract_text?: boolean
  analyze_colors?: boolean
  detect_faces?: boolean
  speech_to_text?: boolean
  analyze_audio?: boolean
  analyze_frames?: boolean
  extract_audio?: boolean
  analyze_text?: boolean
  analyze_structure?: boolean
}

interface ProcessingResult {
  processing_id: string
  input_types: string[]
  results: {
    text?: {
      analysis?: {
        keywords?: Array<{ word: string; score: number }>
        sentiment?: { label: string; score: number }
        summary?: string
      }
      statistics?: {
        word_count?: number
        character_count?: number  
        sentence_count?: number
      }
      language?: string
    }
    image?: {
      analysis?: {
        objects?: Array<{ name: string; confidence: number; label?: string }>
        faces?: Array<unknown>
        caption?: string
        ocr_text?: string
      }
      dimensions?: {
        width?: number
        height?: number
      }
      format?: string
    }
    audio?: {
      analysis?: {
        transcription?: string
      }
    }
    cross_modal?: {
      insights?: Array<{ insight: string; confidence: number }>
      correlations?: Array<{ 
        correlation: string; 
        strength: number;
        description?: string;
        correlation_score?: number;
      }>
      combined_narrative?: string
    }
  }
  metadata: Record<string, unknown>
  processing_time: number
  error?: string
}

interface FileInfo {
  file: File
  type: 'text' | 'image' | 'audio' | 'video' | 'document'
  preview?: string
}

const MultiModalProcessor: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [textInput, setTextInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<ProcessingResult | null>(null)
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    analyze_sentiment: true,
    summarize: true,
    extract_keywords: true,
    detect_language: true,
    generate_caption: true,
    detect_objects: true,
    extract_text: true,
    analyze_colors: false,
    detect_faces: true,
    speech_to_text: true,
    analyze_audio: false,
    analyze_frames: true,
    extract_audio: false,
    analyze_text: true,
    analyze_structure: true,
  })

  const [activeTab, setActiveTab] = useState('input')
  const [audioRecording, setAudioRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): 'text' | 'image' | 'audio' | 'video' | 'document' => {
    const type = file.type
    if (type.startsWith('text/') || file.name.endsWith('.txt')) return 'text'
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('audio/')) return 'audio'
    if (type.startsWith('video/')) return 'video'
    if (type === 'application/pdf' || file.name.endsWith('.pdf') ||
        file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'document'
    return 'document'
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const fileType = getFileType(file)
      let preview = undefined

      if (fileType === 'image') {
        preview = URL.createObjectURL(file)
      }

      return {
        file,
        type: fileType,
        preview
      }
    })

    setFiles(prev => [...prev, ...newFiles])
    
    toast({
      title: 'Files Added',
      description: `${acceptedFiles.length} file(s) added for processing`,
    })
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'audio/*': ['.wav', '.mp3', '.m4a', '.flac', '.ogg'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.wmv'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        // Create a file-like object instead of using File constructor
        const file = Object.assign(blob, {
          name: 'recording.wav',
          lastModified: Date.now(),
        }) as File
        
        setFiles(prev => [...prev, {
          file,
          type: 'audio'
        }])

        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setAudioRecording(true)
    } catch (error) {
      toast({
        title: 'Recording Failed',
        description: 'Could not access microphone',
        variant: 'destructive',
      })
    }
  }

  const stopAudioRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setAudioRecording(false)
    }
  }

  const processMultiModal = async () => {
    if (!textInput && files.length === 0) {
      toast({
        title: 'No Input Provided',
        description: 'Please provide text input or upload files',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)
    setResults(null)
    setActiveTab('results')

    try {
      const formData = new FormData()

      // Add text input
      if (textInput.trim()) {
        formData.append('text', textInput)
      }

      // Add files
      files.forEach((fileInfo) => {
        formData.append(fileInfo.type, fileInfo.file)
      })

      // Add processing options
      formData.append('processing_options', JSON.stringify(processingOptions))

      const response = await fetch('/api/agents/multimodal/process_multimodal/', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setResults(result)
        toast({
          title: 'Processing Complete',
          description: `Completed in ${result.processing_time.toFixed(2)} seconds`,
        })
      } else {
        toast({
          title: 'Processing Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process multimodal input',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const exportResults = () => {
    if (!results) return

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multimodal-analysis-${results.processing_id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard',
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />
      case 'image': return <Image className="w-4 h-4" />
      case 'audio': return <Volume2 className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <File className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Multi-Modal AI Processor</h1>
        <p className="text-muted-foreground">
          Advanced AI analysis for text, images, audio, video, and documents
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Input & Files</TabsTrigger>
          <TabsTrigger value="options">Processing Options</TabsTrigger>
          <TabsTrigger value="results">Results & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Text Input
                </CardTitle>
                <CardDescription>
                  Enter text content for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your text here for sentiment analysis, summarization, keyword extraction..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  File Upload
                </CardTitle>
                <CardDescription>
                  Upload images, audio, video, or documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? 'Drop files here...'
                      : 'Drag & drop files here, or click to select'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports images, audio, video, and documents
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    onClick={audioRecording ? stopAudioRecording : startAudioRecording}
                    variant={audioRecording ? 'destructive' : 'outline'}
                    size="sm"
                  >
                    <Mic className={`w-4 h-4 mr-2 ${audioRecording ? 'animate-pulse' : ''}`} />
                    {audioRecording ? 'Stop Recording' : 'Record Audio'}
                  </Button>
                  {audioRecording && (
                    <Badge variant="destructive" className="animate-pulse">
                      Recording...
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((fileInfo, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(fileInfo.type)}
                          <span className="text-sm font-medium truncate">
                            {fileInfo.file.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {fileInfo.preview && (
                        <img
                          src={fileInfo.preview}
                          alt={fileInfo.file.name}
                          className="w-full h-20 object-cover rounded"
                        />
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {Math.round(fileInfo.file.size / 1024)} KB • {fileInfo.type}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              onClick={processMultiModal}
              disabled={processing}
              size="lg"
              className="min-w-[200px]"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Content
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Processing</CardTitle>
                <CardDescription>
                  Configure text analysis options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'analyze_sentiment', label: 'Sentiment Analysis', desc: 'Detect emotional tone' },
                  { key: 'summarize', label: 'Text Summarization', desc: 'Generate content summary' },
                  { key: 'extract_keywords', label: 'Keyword Extraction', desc: 'Find important terms' },
                  { key: 'detect_language', label: 'Language Detection', desc: 'Identify language' },
                ].map(option => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">{option.label}</label>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                    <Switch
                      checked={processingOptions[option.key as keyof ProcessingOptions]}
                      onCheckedChange={(checked) =>
                        setProcessingOptions(prev => ({ ...prev, [option.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vision Processing</CardTitle>
                <CardDescription>
                  Configure image and video analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'generate_caption', label: 'Image Captioning', desc: 'Generate descriptions' },
                  { key: 'detect_objects', label: 'Object Detection', desc: 'Identify objects' },
                  { key: 'extract_text', label: 'OCR Text Extraction', desc: 'Extract text from images' },
                  { key: 'detect_faces', label: 'Face Detection', desc: 'Detect human faces' },
                  { key: 'analyze_colors', label: 'Color Analysis', desc: 'Analyze color palette' },
                ].map(option => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">{option.label}</label>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                    <Switch
                      checked={processingOptions[option.key as keyof ProcessingOptions]}
                      onCheckedChange={(checked) =>
                        setProcessingOptions(prev => ({ ...prev, [option.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audio Processing</CardTitle>
                <CardDescription>
                  Configure audio analysis options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'speech_to_text', label: 'Speech Recognition', desc: 'Convert speech to text' },
                  { key: 'analyze_audio', label: 'Audio Analysis', desc: 'Analyze audio properties' },
                ].map(option => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">{option.label}</label>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                    <Switch
                      checked={processingOptions[option.key as keyof ProcessingOptions]}
                      onCheckedChange={(checked) =>
                        setProcessingOptions(prev => ({ ...prev, [option.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Processing</CardTitle>
                <CardDescription>
                  Configure document analysis options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'analyze_text', label: 'Text Analysis', desc: 'Analyze document content' },
                  { key: 'analyze_structure', label: 'Structure Analysis', desc: 'Analyze document structure' },
                ].map(option => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">{option.label}</label>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                    <Switch
                      checked={processingOptions[option.key as keyof ProcessingOptions]}
                      onCheckedChange={(checked) =>
                        setProcessingOptions(prev => ({ ...prev, [option.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {processing && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                  <h3 className="font-semibold">Processing Multi-Modal Content</h3>
                  <p className="text-muted-foreground">
                    Analyzing your content with advanced AI models...
                  </p>
                  <Progress value={undefined} className="w-full max-w-md mx-auto" />
                </div>
              </CardContent>
            </Card>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Analysis Results</h2>
                  <p className="text-muted-foreground">
                    Processing completed in {results.processing_time.toFixed(2)} seconds
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportResults} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => copyToClipboard(JSON.stringify(results, null, 2))} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.input_types.length}</div>
                      <p className="text-sm text-muted-foreground">Input Types</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Object.keys(results.results).length}</div>
                      <p className="text-sm text-muted-foreground">Analyses</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.processing_time.toFixed(1)}s</div>
                      <p className="text-sm text-muted-foreground">Process Time</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <p className="text-sm text-muted-foreground">Status</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Text Analysis Results */}
              {results.results.text && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Text Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.text.statistics?.word_count || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Words</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.text.statistics?.character_count || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Characters</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.text.statistics?.sentence_count || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Sentences</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.text.language || 'Unknown'}
                        </div>
                        <p className="text-sm text-muted-foreground">Language</p>
                      </div>
                    </div>

                    {results.results.text.analysis?.sentiment && (
                      <div>
                        <h4 className="font-semibold mb-2">Sentiment Analysis</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            results.results.text.analysis.sentiment.label === 'POSITIVE' ? 'default' :
                            results.results.text.analysis.sentiment.label === 'NEGATIVE' ? 'destructive' :
                            'secondary'
                          }>
                            {results.results.text.analysis.sentiment.label}
                          </Badge>
                          <span className="text-sm">
                            Confidence: {(results.results.text.analysis.sentiment.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {results.results.text.analysis?.summary && (
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-sm bg-muted p-3 rounded">
                          {results.results.text.analysis.summary}
                        </p>
                      </div>
                    )}

                    {results.results.text.analysis?.keywords && (
                      <div>
                        <h4 className="font-semibold mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.results.text?.analysis?.keywords?.slice(0, 10).map((keyword: { word: string; score: number }, index: number) => (
                            <Badge key={index} variant="outline">
                              {Array.isArray(keyword) ? keyword[0] : keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Image Analysis Results */}
              {results.results.image && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Image Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.image.dimensions?.width || 0} × {results.results.image.dimensions?.height || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Resolution</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.image.format || 'Unknown'}
                        </div>
                        <p className="text-sm text-muted-foreground">Format</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.image.analysis?.objects?.length || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Objects</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {results.results.image.analysis?.faces?.length || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Faces</p>
                      </div>
                    </div>

                    {results.results.image.analysis?.caption && (
                      <div>
                        <h4 className="font-semibold mb-2">Image Caption</h4>
                        <p className="text-sm bg-muted p-3 rounded">
                          {results.results.image.analysis.caption}
                        </p>
                      </div>
                    )}

                    {results.results.image.analysis?.objects && results.results.image.analysis.objects.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Detected Objects</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {results.results.image?.analysis?.objects?.slice(0, 6).map((obj: { name: string; confidence: number }, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm">{obj.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {(obj.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.results.image.analysis?.ocr_text && (
                      <div>
                        <h4 className="font-semibold mb-2">Extracted Text (OCR)</h4>
                        <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                          {results.results.image.analysis.ocr_text}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Audio Analysis Results */}
              {results.results.audio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      Audio Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.results.audio.analysis?.transcription && (
                      <div>
                        <h4 className="font-semibold mb-2">Speech Transcription</h4>
                        <p className="text-sm bg-muted p-3 rounded">
                          {results.results.audio.analysis.transcription}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(results.results.audio?.analysis?.transcription || '')}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Text
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cross-Modal Analysis */}
              {results.results.cross_modal && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Cross-Modal Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.results.cross_modal.combined_narrative && (
                      <div>
                        <h4 className="font-semibold mb-2">Combined Analysis</h4>
                        <p className="text-sm bg-muted p-3 rounded">
                          {results.results.cross_modal.combined_narrative}
                        </p>
                      </div>
                    )}

                    {results.results.cross_modal.insights && results.results.cross_modal.insights.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Insights</h4>
                        <div className="space-y-2">
                          {results.results.cross_modal?.insights?.map((insight: { insight: string; confidence: number }, index: number) => (
                            <Alert key={index}>
                              <Brain className="h-4 w-4" />
                              <AlertTitle>Insight {index + 1}</AlertTitle>
                              <AlertDescription>{insight.insight}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.results.cross_modal.correlations && results.results.cross_modal.correlations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Content Correlations</h4>
                        <div className="space-y-2">
                          {results.results.cross_modal?.correlations?.map((correlation: { correlation: string; strength: number }, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm">{correlation.correlation}</span>
                              <Badge variant="secondary">
                                {(correlation.strength * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!processing && !results && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Process your content to see detailed AI analysis results here
                  </p>
                  <Button onClick={() => setActiveTab('input')} variant="outline">
                    Go to Input
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MultiModalProcessor