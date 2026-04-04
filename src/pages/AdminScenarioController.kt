package com.diploma.ione.admin

import com.diploma.ione.domain.Scenario
import com.diploma.ione.domain.ScenarioOption
import com.diploma.ione.repo.LessonRepo
import com.diploma.ione.repo.ScenarioOptionRepo
import com.diploma.ione.repo.ScenarioRepo
import org.springframework.web.bind.annotation.*
import org.springframework.transaction.annotation.Transactional

data class CreateScenarioReq(val lessonId: Long, val title: String, val description: String?, val baseImagePath: String?)
data class UpdateScenarioReq(val title: String?, val description: String?, val baseImagePath: String?)
data class CreateOptionReq(val scenarioId: Long, val optionText: String, val resultText: String?, val resultImagePath: String?, val score: Int)
data class UpdateOptionReq(val optionText: String?, val resultText: String?, val resultImagePath: String?, val score: Int?)

@RestController
@RequestMapping("/api/admin")
class AdminScenarioController(
    private val scenarioRepo: ScenarioRepo,
    private val lessonRepo: LessonRepo,
    private val optionRepo: ScenarioOptionRepo
) {
    @PostMapping("/scenarios/add")
    @Transactional
    fun addScenario(@RequestBody req: CreateScenarioReq): Scenario {
        val lesson = lessonRepo.findById(req.lessonId).orElseThrow { error("Lesson not found") }
        return scenarioRepo.save(Scenario(lesson = lesson, title = req.title, description = req.description, baseImagePath = req.baseImagePath))
    }

    @PostMapping("/scenarios/update/{id}")
    @Transactional
    fun updateScenario(@PathVariable id: Long, @RequestBody req: UpdateScenarioReq): Scenario {
        val scenario = scenarioRepo.findById(id).orElseThrow { error("Scenario not found") }
        req.title?.let { scenario.title = it }
        req.description?.let { scenario.description = it }
        req.baseImagePath?.let { scenario.baseImagePath = it }
        return scenarioRepo.save(scenario)
    }

    @PostMapping("/scenarios/delete/{id}")
    @Transactional
    fun deleteScenario(@PathVariable id: Long) = scenarioRepo.deleteById(id)

    @PostMapping("/scenario-options/add")
    @Transactional
    fun addOption(@RequestBody req: CreateOptionReq): ScenarioOption {
        val scenario = scenarioRepo.findById(req.scenarioId).orElseThrow { error("Scenario not found") }
        return optionRepo.save(ScenarioOption(scenario = scenario, optionText = req.optionText, resultText = req.resultText, resultImagePath = req.resultImagePath, score = req.score))
    }

    @PostMapping("/scenario-options/update/{id}")
    @Transactional
    fun updateOption(@PathVariable id: Long, @RequestBody req: UpdateOptionReq): ScenarioOption {
        val option = optionRepo.findById(id).orElseThrow { error("Option not found") }
        req.optionText?.let { option.optionText = it }
        req.resultText?.let { option.resultText = it }
        req.resultImagePath?.let { option.resultImagePath = it }
        req.score?.let { option.score = it }
        return optionRepo.save(option)
    }

    @PostMapping("/scenario-options/delete/{id}")
    @Transactional
    fun deleteOption(@PathVariable id: Long) = optionRepo.deleteById(id)
}