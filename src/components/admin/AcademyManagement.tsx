import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, HelpCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useLearningModules } from '@/hooks/useLearningModules';
import { ServiceType } from '@/types/learning';
import { ModuleForm } from './academy/ModuleForm';
import { QuestionForm } from './academy/QuestionForm';
import { ModuleDetailsModal } from './academy/ModuleDetailsModal';

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'car_wash', label: 'Car Wash' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'maintenance', label: 'Maintenance' }
];

export const AcademyManagement = () => {
  const {
    modules,
    questions,
    isLoading,
    fetchModules,
    fetchQuestions,
    updateModule,
    deleteModule
  } = useLearningModules();
  
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('cleaning');
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filteredModules = modules.filter(module => module.service_type === selectedServiceType);

  const handleTogglePublished = async (moduleId: string, currentStatus: boolean) => {
    await updateModule(moduleId, { is_published: !currentStatus });
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module? This will also delete all associated quiz questions.')) {
      await deleteModule(moduleId);
    }
  };

  const handleViewQuestions = (moduleId: string) => {
    setSelectedModule(moduleId);
    fetchQuestions(moduleId);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Longa Academy Management</h2>
          <p className="text-gray-600">Manage learning modules and quizzes by service type</p>
        </div>
        <Button onClick={() => setIsModuleFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Module
        </Button>
      </div>

      <Tabs value={selectedServiceType} onValueChange={(value) => setSelectedServiceType(value as ServiceType)}>
        <TabsList className="grid w-full grid-cols-8">
          {SERVICE_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="text-sm">
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SERVICE_TYPES.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {type.label} Modules ({filteredModules.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredModules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
                  <p className="text-gray-600 mb-4">Create your first {type.label.toLowerCase()} learning module to get started.</p>
                  <Button onClick={() => setIsModuleFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Module
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModules.map((module) => (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={module.is_published ? 'default' : 'secondary'}>
                              {module.is_published ? 'Published' : 'Draft'}
                            </Badge>
                            {module.is_published ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {module.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewQuestions(module.id)}
                          >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Quiz
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingModule(module.id);
                              setIsModuleFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={module.is_published ? 'secondary' : 'default'}
                            onClick={() => handleTogglePublished(module.id, module.is_published)}
                          >
                            {module.is_published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Module Form Modal */}
      <ModuleForm
        isOpen={isModuleFormOpen}
        onClose={() => {
          setIsModuleFormOpen(false);
          setEditingModule(null);
        }}
        editingModuleId={editingModule}
        defaultServiceType={selectedServiceType}
        onSuccess={() => {
          setIsModuleFormOpen(false);
          setEditingModule(null);
          fetchModules();
        }}
      />

      {/* Module Details Modal with Questions */}
      <ModuleDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedModule(null);
        }}
        moduleId={selectedModule}
        module={selectedModule ? modules.find(m => m.id === selectedModule) : undefined}
        questions={selectedModule ? questions[selectedModule] || [] : []}
        onAddQuestion={() => setIsQuestionFormOpen(true)}
      />

      {/* Question Form Modal */}
      <QuestionForm
        isOpen={isQuestionFormOpen}
        onClose={() => setIsQuestionFormOpen(false)}
        moduleId={selectedModule}
        onSuccess={() => {
          setIsQuestionFormOpen(false);
          if (selectedModule) {
            fetchQuestions(selectedModule);
          }
        }}
      />
    </div>
  );
};
