'use client'

/**
 * Editable Complaint Form Component
 * Step 5: AI results editing interface
 */

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Save, AlertCircle } from 'lucide-react'
import { VisionAnalysisResult, ComplaintData } from '@/types/complaint.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface EditableComplaintFormProps {
  aiAnalysis: VisionAnalysisResult
  onDataChanged: (data: ComplaintData) => void
  onNext: () => void
}

const DEPARTMENTS = [
  'Municipal Corporation',
  'Public Works Department',
  'Water Resources',
  'Electricity Department',
  'Police Department',
  'Health Department',
  'Transport Department',
  'Urban Development',
  'Forest Department',
  'District Administration',
]

const SEVERITY_LEVELS = [
  { value: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' },
]

export default function EditableComplaintForm({
  aiAnalysis,
  onDataChanged,
  onNext,
}: EditableComplaintFormProps) {
  const [complaintType, setComplaintType] = useState(aiAnalysis.type_of_complaint)
  const [description, setDescription] = useState(aiAnalysis.brief_description)
  const [department, setDepartment] = useState(aiAnalysis.govt_dept_of_concern)
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>(
    aiAnalysis.severity
  )
  const [priority, setPriority] = useState(aiAnalysis.suggested_priority)
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Track which fields have been edited
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set())

  // Auto-save timer
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Mark field as edited
  const markFieldEdited = useCallback((fieldName: string) => {
    setEditedFields((prev) => new Set(prev).add(fieldName))
  }, [])

  // Auto-save functionality
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      saveData()
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(timer)
  }, [complaintType, description, department, severity, priority, additionalNotes])

  const saveData = useCallback(() => {
    setIsSaving(true)
    const data: ComplaintData = {
      type: complaintType,
      description,
      department,
      severity,
      priority,
      additionalNotes: additionalNotes || undefined,
    }
    onDataChanged(data)
    setLastSaved(new Date())
    setTimeout(() => setIsSaving(false), 500)
  }, [
    complaintType,
    description,
    department,
    severity,
    priority,
    additionalNotes,
    onDataChanged,
  ])

  const handleNext = () => {
    if (!description.trim()) {
      toast.error('Please provide a description')
      return
    }
    if (!department) {
      toast.error('Please select a department')
      return
    }
    saveData()
    onNext()
  }

  const characterCount = description.length
  const maxCharacters = 1000

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Review AI Analysis
        </h2>
        <p className="text-gray-600">
          Our AI has analyzed your complaint. Please review and edit the details below.
        </p>
      </div>

      {/* Auto-save indicator */}
      <div className="flex items-center justify-end text-sm text-gray-500">
        {isSaving ? (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Saving...
          </span>
        ) : lastSaved && mounted ? (
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        ) : null}
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Complaint Type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="type" className="flex items-center gap-2">
            Complaint Type
            {editedFields.has('type') && (
              <span className="text-xs text-blue-600">(Edited)</span>
            )}
          </Label>
          <div className="relative">
            <Input
              id="type"
              value={complaintType}
              onChange={(e) => {
                setComplaintType(e.target.value)
                markFieldEdited('type')
              }}
              className="pr-10"
              placeholder="E.g., Road Damage, Water Leak"
            />
            <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="description" className="flex items-center gap-2">
            Description
            {editedFields.has('description') && (
              <span className="text-xs text-blue-600">(Edited)</span>
            )}
          </Label>
          <div className="relative">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= maxCharacters) {
                  setDescription(e.target.value)
                  markFieldEdited('description')
                }
              }}
              rows={5}
              className="resize-none pr-10"
              placeholder="Describe the civic issue in detail..."
            />
            <Edit3 className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Provide as much detail as possible</span>
            <span
              className={`${
                characterCount > maxCharacters * 0.9
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </motion.div>

        {/* Department */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="department" className="flex items-center gap-2">
            Department
            {editedFields.has('department') && (
              <span className="text-xs text-blue-600">(Edited)</span>
            )}
          </Label>
          <Select
            value={department}
            onValueChange={(value) => {
              setDepartment(value)
              markFieldEdited('department')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Severity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2">
            Severity
            {editedFields.has('severity') && (
              <span className="text-xs text-blue-600">(Edited)</span>
            )}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {SEVERITY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  setSeverity(level.value as any)
                  markFieldEdited('severity')
                }}
                className={`
                  px-2 py-2.5 md:px-4 md:py-3 rounded-xl md:rounded-lg border-2 font-bold md:font-medium text-xs md:text-sm
                  transition-all duration-200
                  ${
                    severity === level.value
                      ? `${level.color} scale-105 shadow-md`
                      : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 shadow-sm'
                   }
                `}
              >
                {level.value}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Priority */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <Label htmlFor="priority" className="flex items-center gap-2">
            Priority
            {editedFields.has('priority') && (
              <span className="text-xs text-blue-600">(Edited)</span>
            )}
          </Label>
          <Select
            value={priority}
            onValueChange={(value) => {
              setPriority(value)
              markFieldEdited('priority')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Immediate">Immediate</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Additional Notes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
            className="resize-none"
            placeholder="Any additional information or context..."
          />
        </motion.div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3"
      >
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">All fields are editable</p>
          <p className="text-blue-700">
            You can modify any AI-generated content. Changes are auto-saved every 30
            seconds.
          </p>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3 pt-4"
      >
        <Button
          onClick={saveData}
          variant="outline"
          className="flex-1"
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-[#0F4C81] hover:bg-[#0B3C5D]"
        >
          Continue to Preview
        </Button>
      </motion.div>
    </div>
  )
}
